'use client'

export type YandexEvent = { get(name: string): unknown }
export type YandexEvents = {
  add(name: string, handler: (event: YandexEvent) => void): void
  remove(name: string, handler: (event: YandexEvent) => void): void
}
export type YandexGeometry = {
  events: YandexEvents
  getCoordinates(): unknown
}
export type YandexGeoObject = {
  editor: { startDrawing(): Promise<void>; startEditing(): void }
  events: YandexEvents
  geometry: YandexGeometry
}
export type YandexMap = {
  destroy(): void
  events: YandexEvents
  geoObjects: { add(object: YandexGeoObject): void; remove(object: YandexGeoObject): void }
  getCenter(): [number, number]
  getZoom(): number
}
export type YandexMapsAPI = {
  Map: new (node: HTMLElement, state: Record<string, unknown>) => YandexMap
  Placemark: new (geometry: unknown, properties?: Record<string, unknown>, options?: Record<string, unknown>) => YandexGeoObject
  Polygon: new (geometry: unknown, properties?: Record<string, unknown>, options?: Record<string, unknown>) => YandexGeoObject
  ready(callback: () => void): void
}

declare global {
  interface Window {
    ymaps?: YandexMapsAPI
    __voljskyYandexMapsPromise?: Promise<YandexMapsAPI>
  }
}

export function loadYandexMaps(apiKey: string): Promise<YandexMapsAPI> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Yandex Maps requires a browser'))
  if (window.ymaps) return new Promise((resolve) => window.ymaps?.ready(() => resolve(window.ymaps as YandexMapsAPI)))
  if (window.__voljskyYandexMapsPromise) return window.__voljskyYandexMapsPromise

  window.__voljskyYandexMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`
    script.async = true
    script.onerror = () => reject(new Error('Не удалось загрузить Яндекс Карты'))
    script.onload = () => {
      if (!window.ymaps) return reject(new Error('Яндекс Карты не инициализированы'))
      window.ymaps.ready(() => resolve(window.ymaps as YandexMapsAPI))
    }
    document.head.appendChild(script)
  })

  return window.__voljskyYandexMapsPromise
}
