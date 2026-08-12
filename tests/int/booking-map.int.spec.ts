import { describe, expect, it } from 'vitest'

import {
  getBookableMapObject,
  normalizeBookingMap,
  toYandexCoordinates,
} from '@/modules/booking-map/model'

describe('booking map model', () => {
  it('normalizes editable polygons and points without losing booking metadata', () => {
    const map = normalizeBookingMap({
      center: [48.7, 53.3],
      zoom: 17,
      objects: [
        {
          id: 'house-1',
          bookingUrl: 'https://n123.yclients.com/company/1/record-type/2',
          category: 'water',
          coordinates: [
            [48.7, 53.3],
            [48.701, 53.3],
            [48.701, 53.301],
          ],
          description: 'Дом у воды',
          kind: 'polygon',
          name: 'Дом 1',
          price: 'от 8 000 ₽',
          status: 'available',
        },
        {
          id: 'reception',
          coordinates: [[48.702, 53.302]],
          kind: 'point',
          name: 'Ресепшен',
          status: 'unavailable',
        },
      ],
    })

    expect(map.center).toEqual([48.7, 53.3])
    expect(map.zoom).toBe(17)
    expect(map.objects).toHaveLength(2)
    expect(map.objects[0]).toMatchObject({ id: 'house-1', kind: 'polygon', name: 'Дом 1' })
    expect(toYandexCoordinates(map.objects[0])).toEqual([
      [
        [53.3, 48.7],
        [53.3, 48.701],
        [53.301, 48.701],
      ],
    ])
  })

  it('rejects invalid geometry and clamps the map viewport', () => {
    const map = normalizeBookingMap({
      center: [999, -999],
      objects: [
        { id: 'bad', kind: 'polygon', name: 'Broken', coordinates: [[48.7, 53.3]] },
        { id: 'ok', kind: 'point', name: 'Точка', coordinates: [[48.7, 53.3]] },
      ],
      zoom: 99,
    })

    expect(map.center).toEqual([180, -90])
    expect(map.zoom).toBe(21)
    expect(map.objects.map((object) => object.id)).toEqual(['ok'])
  })

  it('allows booking only for available objects with a safe YCLIENTS URL', () => {
    expect(
      getBookableMapObject({
        id: 'house-1',
        kind: 'point',
        coordinates: [[48.7, 53.3]],
        name: 'Дом 1',
        status: 'available',
        bookingUrl: 'https://n123.yclients.com/company/1/record-type/2',
      }),
    ).toMatchObject({ bookingHref: 'https://n123.yclients.com/company/1/record-type/2' })

    expect(
      getBookableMapObject({
        id: 'house-2',
        kind: 'point',
        coordinates: [[48.7, 53.3]],
        name: 'Дом 2',
        status: 'reserved',
        bookingUrl: 'https://n123.yclients.com/company/1/record-type/2',
      }),
    ).toBeNull()

    expect(
      getBookableMapObject({
        id: 'house-3',
        kind: 'point',
        coordinates: [[48.7, 53.3]],
        name: 'Дом 3',
        status: 'available',
        bookingUrl: 'https://evil.example/steal',
      }),
    ).toBeNull()
  })
})
