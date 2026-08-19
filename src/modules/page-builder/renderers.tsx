import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { getBookingHref } from '@/modules/booking/getBookingHref'
import { YclientsBookingDialog } from '@/modules/booking/YclientsBookingDialog'
import { normalizeBookingMap } from '@/modules/booking-map/model'
import { PublicBookingMap } from '@/modules/booking-map/PublicBookingMap'
import { TestimonialsSection } from '@/modules/guest-reviews/TestimonialsSection'
import type {
  Media as MediaResource,
} from '@/payload-types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type ButtonData = { id?: string | null; label?: string | null; newTab?: boolean | null; url?: string | null }
type BlockItem = {
  answer?: string | null
  author?: string | null
  bookingUrl?: string | null
  caption?: string | null
  capacity?: number | null
  features?: { id?: string | null; text?: string | null }[] | null
  icon?: string | null
  id?: string | null
  image?: number | MediaResource | null
  label?: string | null
  name?: string | null
  number?: string | null
  price?: string | null
  question?: string | null
  rating?: number | null
  status?: string | null
  summary?: string | null
  text?: string | null
  title?: string | null
  url?: string | null
  value?: string | null
  x?: number | null
  y?: number | null
}

type BlockData = {
  address?: string | null
  anchor?: string | null
  blockType?: string
  body?: SerializedEditorState | null
  bookingMap?: unknown
  buttonLabel?: string | null
  buttons?: ButtonData[] | null
  description?: string | null
  disableInnerContainer?: boolean
  email?: string | null
  eyebrow?: string | null
  fallbackText?: string | null
  filters?: BlockItem[] | null
  height?: string | null
  image?: number | MediaResource | null
  imagePosition?: string | null
  items?: BlockItem[] | null
  images?: BlockItem[] | null
  latitude?: number | string | null
  layout?: string | null
  longitude?: number | string | null
  mapEmbedUrl?: string | null
  maxItems?: number | string | null
  objects?: BlockItem[] | null
  overlay?: number | null
  phone?: string | null
  planImage?: number | MediaResource | null
  showForm?: boolean | null
  theme?: string | null
  title?: string | null
  workingHours?: string | null
  yclientsUrl?: string | null
}

type Renderer = React.ComponentType<BlockData>

const Section = ({ children, block, className = '' }: { children: React.ReactNode; block: BlockData; className?: string }) => {
  const hasHeader = block.eyebrow || block.title || block.description

  return (
    <section
      className={`vb-section vb-section--${block.theme || 'light'} ${className}`.trim()}
      id={block.anchor || undefined}
    >
      <div className="container">
        {hasHeader && (
          <div className="vb-section__header">
            {block.eyebrow && <p className="vb-eyebrow">{block.eyebrow}</p>}
            {block.title && <h2 className="vb-title">{block.title}</h2>}
            {block.description && <p className="vb-lead">{block.description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

const Image = ({
  resource,
  className = '',
  alt = '',
  priority = false,
  size,
}: {
  resource?: number | MediaResource | null
  className?: string
  alt?: string
  priority?: boolean
  size?: string
}) =>
  resource && typeof resource === 'object' ? (
    <Media
      alt={alt}
      className={className}
      imgClassName="object-cover"
      loading={priority ? 'eager' : undefined}
      priority={priority}
      resource={resource as never}
      size={size}
    />
  ) : null

const Buttons = ({ items }: { items?: ButtonData[] | null }) =>
  Array.isArray(items) && items.length ? (
    <div className="vb-buttons">
      {items.map((item, index) => (
        <Link className="vb-button" href={item.url || '#'} key={item.id || index} target={item.newTab ? '_blank' : undefined}>
          {item.label}
        </Link>
      ))}
    </div>
  ) : null

const SiteHeroRenderer: Renderer = (block) => (
  <section
    className={`vb-hero vb-hero--large${String(block.title || '').length > 34 ? ' vb-hero--long-title' : ''}`}
    id={block.anchor || undefined}
  >
    <Image
      alt={String(block.title || '')}
      className="vb-hero__media"
      priority
      resource={block.image}
      size="(max-width: 640px) 180vh, 100vw"
    />
    <div className="vb-hero__overlay" style={{ opacity: Number(block.overlay || 35) / 100 }} />
    <div className="container vb-hero__content">
      {block.eyebrow && <p className="vb-eyebrow">{block.eyebrow}</p>}
      <h1>{block.title}</h1>
      {block.description && <p>{block.description}</p>}
      <Buttons items={block.buttons} />
    </div>
  </section>
)

const SplitContentRenderer: Renderer = (block) => (
  <section
    className={`vb-section vb-section--${block.theme || 'light'} vb-section--split`}
    id={block.anchor || undefined}
  >
    <div className="container">
      <div className={`vb-split vb-split--${block.imagePosition || 'right'}`}>
        <Image alt={String(block.title || '')} className="vb-split__media" resource={block.image} />
        <div className="vb-split__content">
          {block.eyebrow && <p className="vb-eyebrow">{block.eyebrow}</p>}
          {block.title && <h2 className="vb-title">{block.title}</h2>}
          {block.body ? (
            <RichText className="vb-richtext" data={block.body} enableGutter={false} />
          ) : block.description ? (
            <p className="vb-lead">{block.description}</p>
          ) : null}
          <Buttons items={block.buttons} />
        </div>
      </div>
    </div>
  </section>
)

const CardGrid: Renderer = (block) => (
  <Section block={block} className={`vb-section--${block.blockType}`}>
    <div className={`vb-grid vb-grid--${block.blockType}`}>
      {block.items?.map((item, index) => {
        const hasMedia = item.image && typeof item.image === 'object'

        return (
          <article className={`vb-card vb-card--${hasMedia ? 'media' : 'feature'}`} key={item.id || index}>
            <Image alt={String(item.title || item.name || '')} resource={item.image} />
            {item.icon && <span className="vb-card__icon">{item.icon}</span>}
            <h3>{item.title || item.name}</h3>
            <p>{item.text || item.summary}</p>
            {item.price && <strong>{item.price}</strong>}
          </article>
        )
      })}
    </div>
  </Section>
)

const StaysRenderer: Renderer = (block) => (
  <Section block={block} className="vb-section--stays">
    <div className="vb-grid vb-grid--stays">
      {block.items?.map((item, index) => {
        const hasMedia = item.image && typeof item.image === 'object'
        const features = Array.isArray(item.features)
          ? item.features.filter((feature) => typeof feature?.text === 'string' && feature.text.trim())
          : []

        return (
          <article className={`vb-card vb-card--${hasMedia ? 'media' : 'feature'} vb-stays-card`} key={item.id || index}>
            <Image alt={String(item.name || item.title || '')} resource={item.image} />
            <h3>{item.name || item.title}</h3>
            {(item.summary || item.text) && <p>{item.summary || item.text}</p>}
            {(Number.isFinite(Number(item.capacity)) || features.length > 0) && (
              <div className="vb-stays-card__facts">
                {Number.isFinite(Number(item.capacity)) && <span>До {Number(item.capacity)} гостей</span>}
                {features.length > 0 && (
                  <ul className="vb-stays-card__features">
                    {features.map((feature, featureIndex) => (
                      <li key={feature.id || featureIndex}>{feature.text?.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {item.price && <strong>{item.price}</strong>}
            {item.bookingUrl && (
              <Link
                className="vb-button vb-button--small vb-stays-card__action"
                href={item.bookingUrl}
                target={/^https?:\/\//.test(item.bookingUrl) ? '_blank' : undefined}
              >
                Узнать даты
              </Link>
            )}
          </article>
        )
      })}
    </div>
  </Section>
)

const FeatureGridRenderer: Renderer = (block) => (
  <Section block={block} className="vb-section--featureGrid">
    <ol className="vb-feature-strip">
      {block.items?.map((item, index) => (
        <li className="vb-feature-strip__item" key={item.id || index}>
          <span className="vb-feature-strip__number" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3>{item.title}</h3>
          {item.text && <p>{item.text}</p>}
        </li>
      ))}
    </ol>
  </Section>
)

const GalleryRenderer: Renderer = (block) => (
  <Section block={block} className="vb-section--gallery">
    <div className={`vb-gallery vb-gallery--${block.layout || 'mosaic'}`}>
      {block.images?.map((item, index) => (
        <figure key={item.id || index}>
          <Image alt={String(item.caption || '')} resource={item.image} />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      ))}
    </div>
  </Section>
)

const MapPlanRenderer: Renderer = (block) => {
  const bookingMap = normalizeBookingMap(block.bookingMap)

  if (bookingMap.objects.length === 0 && !block.planImage) return null

  return (
    <Section block={block} className="vb-section--map">
      {bookingMap.objects.length > 0 ? (
        <PublicBookingMap apiKey={process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY} value={bookingMap} />
      ) : (
        <figure className="vb-plan-reference">
          <Image
            alt="Схема расположения домов и береговой инфраструктуры"
            className="vb-plan-reference__media"
            resource={block.planImage}
            size="(max-width: 1440px) calc(100vw - 2rem), 1376px"
          />
          <figcaption>
            Схема расположения домов и береговой инфраструктуры. Актуальную доступность уточняйте при бронировании.
          </figcaption>
        </figure>
      )}
    </Section>
  )
}

const LocationMapRenderer: Renderer = (block) => {
  const latitude = Number(block.latitude)
  const longitude = Number(block.longitude)

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) return null

  const latitudeLabel = latitude.toFixed(6)
  const longitudeLabel = longitude.toFixed(6)
  const marker = `${latitudeLabel},${longitudeLabel}`
  const bbox = [
    longitude - 0.012,
    latitude - 0.006,
    longitude + 0.012,
    latitude + 0.006,
  ].map((coordinate) => coordinate.toFixed(6)).join(',')
  const embedParams = new URLSearchParams({ bbox, layer: 'mapnik', marker })
  const mapHref = `https://www.openstreetmap.org/?mlat=${latitudeLabel}&mlon=${longitudeLabel}#map=15/${latitudeLabel}/${longitudeLabel}`

  return (
    <Section block={block} className="vb-section--location-map">
      <div className="vb-location-map">
        <div className="vb-location-map__meta">
          <div>
            {block.address && <p className="vb-location-map__address">{block.address}</p>}
            <p className="vb-location-map__coordinates">{latitudeLabel}, {longitudeLabel}</p>
          </div>
          <a href={mapHref} rel="noreferrer" target="_blank">Открыть точку на карте</a>
        </div>
        <iframe
          className="vb-location-map__canvas"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={`https://www.openstreetmap.org/export/embed.html?${embedParams.toString()}`}
          title="Карта расположения Иенево. Берег"
        />
      </div>
    </Section>
  )
}

const TestimonialsRenderer: Renderer = (block) => <TestimonialsSection block={block} />

const FaqRenderer: Renderer = (block) => (
  <Section block={block} className="vb-section--faq">
    <div className="vb-faq">
      {block.items?.map((item, index) => (
        <details key={item.id || index}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  </Section>
)

const PromoRenderer: Renderer = (block) => (
  <Section block={block} className="vb-section--promo">
    <Image alt={String(block.title || '')} resource={block.image} />
    <Buttons items={block.buttons} />
  </Section>
)

const ContactsRenderer: Renderer = (block) => (
  <Section block={block} className="vb-section--contacts">
    <address className="vb-contacts">
      {block.address && <p>{block.address}</p>}
      {block.phone && <a href={`tel:${block.phone}`}>{block.phone}</a>}
      {block.email && <a href={`mailto:${block.email}`}>{block.email}</a>}
      {block.workingHours && <p>{block.workingHours}</p>}
    </address>
    {block.mapEmbedUrl && <iframe className="vb-map" loading="lazy" src={block.mapEmbedUrl} title="Карта проезда" />}
  </Section>
)

export const isUnavailableBooking = (block?: BlockData) => {
  if (!block || block.blockType !== 'booking') return false

  const href = getBookingHref(block.yclientsUrl || process.env.NEXT_PUBLIC_YCLIENTS_URL)
  return href.includes('#booking-setup')
}

export const ContactBookingRenderer = ({
  booking,
  contact,
}: {
  booking: BlockData
  contact: BlockData
}) => (
  <section
    className={`vb-section vb-section--${contact.theme || 'light'} vb-section--contact-service`}
    id={contact.anchor || booking.anchor || undefined}
  >
    <div className="container">
      <div className="vb-section__header">
        {contact.eyebrow && <p className="vb-eyebrow">{contact.eyebrow}</p>}
        {contact.title && <h2 className="vb-title">{contact.title}</h2>}
        {contact.description && <p className="vb-lead">{contact.description}</p>}
      </div>

      <div className="vb-contact-service">
        <address className="vb-contact-service__details">
          {contact.address && <p>{contact.address}</p>}
          {contact.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.workingHours && <p>{contact.workingHours}</p>}
        </address>

        <div className="vb-contact-service__booking" id="booking-setup">
          <p className="vb-contact-service__label">Бронирование</p>
          <p>{booking.fallbackText || 'Онлайн-запись скоро появится. Свяжитесь с нами по телефону.'}</p>
        </div>
      </div>

      {contact.mapEmbedUrl && (
        <iframe className="vb-map" loading="lazy" src={contact.mapEmbedUrl} title="Карта проезда" />
      )}
    </div>
  </section>
)

const BookingRenderer: Renderer = (block) => {
  const href = getBookingHref(block.yclientsUrl || process.env.NEXT_PUBLIC_YCLIENTS_URL)
  const configured = !href.includes('#booking-setup')
  const nativeFlow = process.env.NODE_ENV !== 'test' && (process.env.YCLIENTS_NATIVE_FLOW === 'true' || process.env.YCLIENTS_DEMO_MODE === 'true')

  if (!configured) return null

  return (
    <Section
      block={nativeFlow ? { ...block, description: 'Свободные даты и время загружаются через серверную интеграцию YCLIENTS.' } : block}
      className="vb-section--booking"
    >
      <YclientsBookingDialog
        buttonLabel={block.buttonLabel || 'Забронировать'}
        description={block.description || 'Даты и доступность открываются в форме YCLIENTS.'}
        href={href}
        nativeFlow={nativeFlow}
        title={block.title || 'Выберите удобное время отдыха'}
      />
    </Section>
  )
}

export const blockRenderers: Record<string, Renderer> = {
  siteHero: SiteHeroRenderer,
  splitContent: SplitContentRenderer,
  featureGrid: FeatureGridRenderer,
  gallery: GalleryRenderer,
  stays: StaysRenderer,
  mapPlan: MapPlanRenderer,
  locationMap: LocationMapRenderer,
  activities: CardGrid,
  testimonials: TestimonialsRenderer,
  faq: FaqRenderer,
  promo: PromoRenderer,
  contacts: ContactsRenderer,
  booking: BookingRenderer,
}
