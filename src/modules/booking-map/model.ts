import { getBookingHref } from '@/modules/booking/getBookingHref'

export type BookingMapStatus = 'available' | 'reserved' | 'unavailable'
export type BookingMapKind = 'point' | 'polygon'
export type BookingMapCoordinate = [longitude: number, latitude: number]

export type BookingMapObject = {
  id: string
  name: string
  kind: BookingMapKind
  coordinates: BookingMapCoordinate[]
  status: BookingMapStatus
  category?: string
  price?: string
  description?: string
  bookingUrl?: string
}

export type BookingMapValue = {
  center: BookingMapCoordinate
  zoom: number
  objects: BookingMapObject[]
}

const finite = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const coordinate = (value: unknown): BookingMapCoordinate | null => {
  if (!Array.isArray(value) || value.length < 2) return null
  const longitude = finite(value[0], Number.NaN)
  const latitude = finite(value[1], Number.NaN)
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null
  return [clamp(longitude, -180, 180), clamp(latitude, -90, 90)]
}

export function normalizeBookingMap(value: unknown): BookingMapValue {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const center = coordinate(source.center) || [48.707, 53.317]
  const objects = Array.isArray(source.objects)
    ? source.objects.flatMap((entry): BookingMapObject[] => {
        if (!entry || typeof entry !== 'object') return []
        const item = entry as Record<string, unknown>
        const kind: BookingMapKind = item.kind === 'polygon' ? 'polygon' : 'point'
        const coordinates = Array.isArray(item.coordinates)
          ? item.coordinates.flatMap((item) => {
              const normalized = coordinate(item)
              return normalized ? [normalized] : []
            })
          : []
        if (
          typeof item.id !== 'string' ||
          !item.id.trim() ||
          typeof item.name !== 'string' ||
          !item.name.trim() ||
          (kind === 'polygon' ? coordinates.length < 3 : coordinates.length < 1)
        ) return []
        const status: BookingMapStatus =
          item.status === 'reserved' || item.status === 'unavailable' ? item.status : 'available'
        return [{
          id: item.id.trim(),
          name: item.name.trim(),
          kind,
          coordinates,
          status,
          ...(typeof item.category === 'string' && item.category ? { category: item.category } : {}),
          ...(typeof item.price === 'string' && item.price ? { price: item.price } : {}),
          ...(typeof item.description === 'string' && item.description ? { description: item.description } : {}),
          ...(typeof item.bookingUrl === 'string' && item.bookingUrl ? { bookingUrl: item.bookingUrl } : {}),
        }]
      })
    : []

  return {
    center,
    zoom: clamp(Math.round(finite(source.zoom, 17)), 1, 21),
    objects,
  }
}

export function toYandexCoordinates(object: BookingMapObject): number[][][] | number[] {
  const coordinates = object.coordinates.map(([longitude, latitude]) => [latitude, longitude])
  return object.kind === 'polygon' ? [coordinates] : coordinates[0]
}

export function fromYandexCoordinates(kind: BookingMapKind, value: unknown): BookingMapCoordinate[] {
  const source = kind === 'polygon' && Array.isArray(value) ? value[0] : [value]
  if (!Array.isArray(source)) return []
  return source.flatMap((item) => {
    if (!Array.isArray(item) || item.length < 2) return []
    const latitude = finite(item[0], Number.NaN)
    const longitude = finite(item[1], Number.NaN)
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      ? [[clamp(longitude, -180, 180), clamp(latitude, -90, 90)] as BookingMapCoordinate]
      : []
  })
}

export function getBookableMapObject(object: BookingMapObject) {
  if (object.status !== 'available') return null
  const bookingHref = getBookingHref(object.bookingUrl)
  if (bookingHref.startsWith('/contacts#')) return null
  return { ...object, bookingHref }
}
