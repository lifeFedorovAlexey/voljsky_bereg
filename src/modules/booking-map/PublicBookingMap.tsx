'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import type { BookingMapObject } from './model'
import { getBookableMapObject, normalizeBookingMap, toYandexCoordinates } from './model'
import { loadYandexMaps, type YandexMap } from './loadYandexMaps'

const colors = { available: '#69a95a', reserved: '#c6884d', unavailable: '#727872' }

type Props = { apiKey?: string; value: unknown }

export function PublicBookingMap({ apiKey, value }: Props) {
  const mapValue = useMemo(() => normalizeBookingMap(value), [value])
  const mapNode = useRef<HTMLDivElement>(null)
  const [selectedID, setSelectedID] = useState(mapValue.objects[0]?.id)
  const [error, setError] = useState<string | null>(null)
  const selected = mapValue.objects.find((object) => object.id === selectedID)

  useEffect(() => {
    if (!apiKey || !mapNode.current) return
    let disposed = false
    let map: YandexMap | undefined
    loadYandexMaps(apiKey)
      .then((ymaps) => {
        if (disposed || !mapNode.current) return
        const createdMap = new ymaps.Map(mapNode.current, {
          center: [mapValue.center[1], mapValue.center[0]],
          controls: ['zoomControl', 'fullscreenControl'],
          zoom: mapValue.zoom,
        })
        map = createdMap
        mapValue.objects.forEach((object) => {
          const color = colors[object.status]
          const properties = { hintContent: object.name }
          const options = object.kind === 'polygon'
            ? { fillColor: `${color}99`, strokeColor: '#ffffff', strokeWidth: 2 }
            : { iconColor: color }
          const geoObject = object.kind === 'polygon'
            ? new ymaps.Polygon(toYandexCoordinates(object), properties, options)
            : new ymaps.Placemark(toYandexCoordinates(object), properties, options)
          geoObject.events.add('click', () => setSelectedID(object.id))
          createdMap.geoObjects.add(geoObject)
        })
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Карта недоступна'))
    return () => { disposed = true; map?.destroy() }
  }, [apiKey, mapValue])

  if (!apiKey) {
    return <div className="vb-booking-map__missing">Для интерактивной карты нужен ключ Яндекс Карт. Объекты и бронирование сохранятся после настройки ключа.</div>
  }

  return (
    <div className="vb-booking-map">
      <div className="vb-booking-map__canvas" ref={mapNode} />
      {error && <p className="vb-booking-map__error">{error}</p>}
      {selected && <BookingObjectCard object={selected} />}
    </div>
  )
}

function BookingObjectCard({ object }: { object: BookingMapObject }) {
  const bookable = getBookableMapObject(object)
  return (
    <aside className="vb-booking-map__card" aria-live="polite">
      <span className={`vb-booking-map__status vb-booking-map__status--${object.status}`}>
        {object.status === 'available' ? 'Свободно' : object.status === 'reserved' ? 'Забронировано' : 'Недоступно'}
      </span>
      <h3>{object.name}</h3>
      {object.description && <p>{object.description}</p>}
      {object.price && <strong>{object.price}</strong>}
      {bookable ? <a className="vb-button" href={bookable.bookingHref} rel="noreferrer" target="_blank">Забронировать</a> : <span className="vb-booking-map__not-bookable">Сейчас нельзя забронировать</span>}
    </aside>
  )
}
