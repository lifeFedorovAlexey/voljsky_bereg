'use client'

import { FieldDescription, FieldLabel, useField } from '@payloadcms/ui'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { loadYandexMaps, type YandexEvent, type YandexGeoObject, type YandexMap } from './loadYandexMaps'
import {
  fromYandexCoordinates,
  normalizeBookingMap,
  toYandexCoordinates,
  type BookingMapKind,
  type BookingMapObject,
  type BookingMapValue,
} from './model'

import './admin.css'

type Props = { field: { label?: string }; path: string }
const statusOptions = [
  ['available', 'Доступен для бронирования'],
  ['reserved', 'Забронирован'],
  ['unavailable', 'Недоступен'],
] as const

export function BookingMapField({ field, path }: Props) {
  const { setValue, value } = useField<unknown>({ path })
  const mapValue = useMemo(() => normalizeBookingMap(value), [value])
  const mapValueRef = useRef(mapValue)
  mapValueRef.current = mapValue
  const mapNode = useRef<HTMLDivElement>(null)
  const mapRef = useRef<YandexMap | null>(null)
  const geoObjects = useRef(new Map<string, YandexGeoObject>())
  const [selectedID, setSelectedID] = useState<string | null>(mapValue.objects[0]?.id || null)
  const [mapReady, setMapReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY

  const update = (next: BookingMapValue) => setValue(next)
  const updateObject = (id: string, patch: Partial<BookingMapObject>) => update({
    ...mapValue,
    objects: mapValue.objects.map((object) => object.id === id ? { ...object, ...patch } : object),
  })

  useEffect(() => {
    if (!apiKey || !mapNode.current) return
    let disposed = false
    loadYandexMaps(apiKey).then((ymaps) => {
      if (disposed || !mapNode.current) return
      const map = new ymaps.Map(mapNode.current, {
        center: [mapValue.center[1], mapValue.center[0]],
        controls: ['zoomControl', 'fullscreenControl'],
        zoom: mapValue.zoom,
      })
      mapRef.current = map
      setMapReady(true)
      map.events.add('boundschange', () => {
        const [latitude, longitude] = map.getCenter()
        setValue({ ...mapValueRef.current, center: [longitude, latitude], zoom: map.getZoom() })
      })
      return map
    }).catch(() => setMessage('Не удалось загрузить Яндекс Карты. Проверьте API-ключ и разрешённый домен.'))
    return () => { disposed = true; setMapReady(false); mapRef.current?.destroy(); mapRef.current = null }
    // The map is mounted once. Data changes are synchronized by the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  useEffect(() => {
    const map = mapRef.current
    const ymaps = window.ymaps
    if (!map || !ymaps) return
    geoObjects.current.forEach((geoObject) => map.geoObjects.remove(geoObject))
    geoObjects.current.clear()
    mapValue.objects.forEach((object) => {
      const options = object.kind === 'polygon'
        ? { fillColor: '#69a95a88', strokeColor: '#ffffff', strokeWidth: 3 }
        : { iconColor: '#69a95a', draggable: true }
      const geoObject = object.kind === 'polygon'
        ? new ymaps.Polygon(toYandexCoordinates(object), { hintContent: object.name }, options)
        : new ymaps.Placemark(toYandexCoordinates(object), { hintContent: object.name }, options)
      geoObject.events.add('click', () => setSelectedID(object.id))
      if (object.kind === 'point') {
        geoObject.events.add('dragend', () => updateObject(object.id, {
          coordinates: fromYandexCoordinates('point', geoObject.geometry.getCoordinates()),
        }))
      }
      map.geoObjects.add(geoObject)
      geoObjects.current.set(object.id, geoObject)
      if (object.id === selectedID && object.kind === 'polygon') {
        geoObject.editor.startEditing()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, mapValue.objects, selectedID])

  const createObject = (kind: BookingMapKind, coordinates: BookingMapObject['coordinates']) => {
    const id = `object-${Date.now()}`
    const object: BookingMapObject = {
      id,
      kind,
      coordinates,
      name: kind === 'polygon' ? 'Новый объект' : 'Новая точка',
      status: 'available',
    }
    update({ ...mapValue, objects: [...mapValue.objects, object] })
    setSelectedID(id)
  }

  const addPoint = () => {
    const map = mapRef.current
    if (!map) return
    setMessage('Кликните по карте, чтобы поставить точку.')
    const handler = (event: YandexEvent) => {
      createObject('point', fromYandexCoordinates('point', event.get('coords')))
      map.events.remove('click', handler)
      setMessage(null)
    }
    map.events.add('click', handler)
  }

  const drawPolygon = () => {
    const map = mapRef.current
    const ymaps = window.ymaps
    if (!map || !ymaps) return
    const polygon = new ymaps.Polygon([], {}, { fillColor: '#69a95a88', strokeColor: '#ffffff', strokeWidth: 3 })
    map.geoObjects.add(polygon)
    setMessage('Кликайте по углам объекта. Дважды кликните по последней точке, чтобы завершить.')
    polygon.editor.startDrawing().then(() => {
      const coordinates = fromYandexCoordinates('polygon', polygon.geometry.getCoordinates())
      map.geoObjects.remove(polygon)
      if (coordinates.length >= 3) createObject('polygon', coordinates)
      setMessage(null)
    })
  }

  const selected = mapValue.objects.find((object) => object.id === selectedID)
  const saveEditedPolygon = () => {
    if (!selected || selected.kind !== 'polygon') return
    const geoObject = geoObjects.current.get(selected.id)
    if (!geoObject) return
    updateObject(selected.id, {
      coordinates: fromYandexCoordinates('polygon', geoObject.geometry.getCoordinates()),
    })
    setMessage('Изменённый контур записан в форму. Сохраните страницу, чтобы опубликовать его.')
  }

  return (
    <div className="booking-map-field field-type">
      <FieldLabel label={field.label || 'Карта объектов бронирования'} path={path} />
      <FieldDescription description="Нарисуйте контуры домов и участков. Эти же фигуры посетитель увидит на сайте и сможет выбрать для бронирования." path={path} />
      {!apiKey ? (
        <div className="booking-map-field__setup">
          <strong>Яндекс Карты ещё не подключены</strong>
          <p>Добавьте <code>NEXT_PUBLIC_YANDEX_MAPS_API_KEY</code> в окружение и перезапустите сайт. Данные этого блока сохранятся.</p>
        </div>
      ) : (
        <>
          <div className="booking-map-field__toolbar">
            <button onClick={drawPolygon} type="button">Нарисовать участок</button>
            <button onClick={addPoint} type="button">Поставить точку</button>
            <span>{message}</span>
          </div>
          <div className="booking-map-field__canvas" ref={mapNode} />
        </>
      )}
      <div className="booking-map-field__objects">
        {mapValue.objects.map((object) => (
          <button className={object.id === selectedID ? 'is-selected' : ''} key={object.id} onClick={() => setSelectedID(object.id)} type="button">
            <strong>{object.name}</strong><span>{object.kind === 'polygon' ? 'Контур' : 'Точка'}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="booking-map-field__form">
          <label>Код объекта<input readOnly value={selected.id} /></label>
          <label>Название<input value={selected.name} onChange={(event) => updateObject(selected.id, { name: event.target.value })} /></label>
          <label>Статус<select value={selected.status} onChange={(event) => updateObject(selected.id, { status: event.target.value as BookingMapObject['status'] })}>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Категория<input value={selected.category || ''} onChange={(event) => updateObject(selected.id, { category: event.target.value })} /></label>
          <label>Цена<input value={selected.price || ''} onChange={(event) => updateObject(selected.id, { price: event.target.value })} /></label>
          <label className="is-wide">Описание<textarea value={selected.description || ''} onChange={(event) => updateObject(selected.id, { description: event.target.value })} /></label>
          <label className="is-wide">Ссылка YCLIENTS для этого объекта<input value={selected.bookingUrl || ''} onChange={(event) => updateObject(selected.id, { bookingUrl: event.target.value })} /></label>
          {selected.kind === 'polygon' && apiKey && <button className="booking-map-field__save-shape" onClick={saveEditedPolygon} type="button">Сохранить изменённый контур</button>}
          <button className="booking-map-field__delete" onClick={() => { update({ ...mapValue, objects: mapValue.objects.filter((item) => item.id !== selected.id) }); setSelectedID(null) }} type="button">Удалить объект</button>
        </div>
      )}
    </div>
  )
}
