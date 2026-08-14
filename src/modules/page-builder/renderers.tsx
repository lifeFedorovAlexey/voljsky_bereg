import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { getBookingHref } from '@/modules/booking/getBookingHref'
import { normalizeBookingMap } from '@/modules/booking-map/model'
import { PublicBookingMap } from '@/modules/booking-map/PublicBookingMap'

type BlockData = Record<string, any>

type Renderer = React.ComponentType<BlockData>

const Section = ({ children, block, className = '' }: { children: React.ReactNode; block: BlockData; className?: string }) => (
  <section
    className={`vb-section vb-section--${block.theme || 'light'} ${className}`.trim()}
    id={block.anchor || undefined}
  >
    <div className="container">
      {block.eyebrow && <p className="vb-eyebrow">{block.eyebrow}</p>}
      {block.title && <h2 className="vb-title">{block.title}</h2>}
      {block.description && <p className="vb-lead">{block.description}</p>}
      {children}
    </div>
  </section>
)

const Image = ({
  resource,
  className = '',
  priority = false,
  size,
}: {
  resource?: unknown
  className?: string
  priority?: boolean
  size?: string
}) =>
  resource && typeof resource === 'object' ? (
    <Media
      className={className}
      imgClassName="object-cover"
      loading={priority ? 'eager' : undefined}
      priority={priority}
      resource={resource as never}
      size={size}
    />
  ) : null

const Buttons = ({ items }: { items?: BlockData[] }) =>
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
  <section className="vb-hero vb-hero--large" id={block.anchor || undefined}>
    <Image
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
  <Section block={{ ...block, description: undefined }}>
    <div className={`vb-split vb-split--${block.imagePosition || 'right'}`}>
      <Image resource={block.image} />
      {block.body ? (
        <RichText className="vb-richtext" data={block.body} enableGutter={false} />
      ) : block.description ? (
        <p className="vb-richtext">{block.description}</p>
      ) : null}
    </div>
    <Buttons items={block.buttons} />
  </Section>
)

const CardGrid: Renderer = (block) => (
  <Section block={block}>
    <div className="vb-grid">
      {block.items?.map((item: BlockData, index: number) => (
        <article className="vb-card" key={item.id || index}>
          <Image resource={item.image} />
          {item.icon && <span className="vb-card__icon">{item.icon}</span>}
          <h3>{item.title || item.name}</h3>
          <p>{item.text || item.summary}</p>
          {item.price && <strong>{item.price}</strong>}
        </article>
      ))}
    </div>
  </Section>
)

const GalleryRenderer: Renderer = (block) => (
  <Section block={block} className="vb-section--gallery">
    <div className={`vb-gallery vb-gallery--${block.layout || 'mosaic'}`}>
      {block.images?.map((item: BlockData, index: number) => (
        <figure key={item.id || index}>
          <Image resource={item.image} />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      ))}
    </div>
  </Section>
)

const MapPlanRenderer: Renderer = (block) => {
  const bookingMap = normalizeBookingMap(block.bookingMap)

  return (
    <Section block={block}>
      {bookingMap.objects.length > 0 ? (
        <PublicBookingMap apiKey={process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY} value={bookingMap} />
      ) : (
        <div className="vb-plan-shell">
          <aside className="vb-plan-panel">
            <p className="vb-plan-panel__label">Подобрать дом</p>
            <div className="vb-plan-filters">
              {block.filters?.map((filter: BlockData, index: number) => (
                <span className="vb-plan-filter" key={filter.id || index}>{filter.label}</span>
              ))}
            </div>
            <div className="vb-plan-legend">
              <span><i className="is-available" />Свободно</span>
              <span><i className="is-reserved" />Забронировано</span>
              <span><i className="is-unavailable" />Недоступно</span>
            </div>
            <p className="vb-plan-panel__hint">Наведите на номер на плане, чтобы увидеть название и цену.</p>
            <Link className="vb-button" href="/contacts#booking">Уточнить свободные даты</Link>
          </aside>
          <div className="vb-plan">
            <Image resource={block.planImage} />
            {block.objects?.map((item: BlockData, index: number) => (
              <a
                aria-label={`${item.number}${item.price ? ` — ${item.price}` : ''}`}
                className={`vb-plan__marker vb-plan__marker--${item.status || 'available'}`}
                href={item.url || '/contacts#booking'}
                key={item.id || index}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                <b>{item.number}</b>
                <span>{item.description}{item.price ? <><br /><strong>{item.price}</strong></> : null}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

const TestimonialsRenderer: Renderer = (block) => (
  <Section block={block}>
    <div className="vb-grid">
      {block.items?.map((item: BlockData, index: number) => (
        <blockquote className="vb-card" key={item.id || index}>
          <p>«{item.text}»</p>
          <footer>{item.author}{item.rating ? ` · ${item.rating}/5` : ''}</footer>
        </blockquote>
      ))}
    </div>
  </Section>
)

const FaqRenderer: Renderer = (block) => (
  <Section block={block}>
    <div className="vb-faq">
      {block.items?.map((item: BlockData, index: number) => (
        <details key={item.id || index}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  </Section>
)

const PromoRenderer: Renderer = (block) => (
  <Section block={block}>
    <Image resource={block.image} />
    <Buttons items={block.buttons} />
  </Section>
)

const ContactsRenderer: Renderer = (block) => (
  <Section block={block}>
    <address className="vb-contacts">
      {block.address && <p>{block.address}</p>}
      {block.phone && <a href={`tel:${block.phone}`}>{block.phone}</a>}
      {block.email && <a href={`mailto:${block.email}`}>{block.email}</a>}
      {block.workingHours && <p>{block.workingHours}</p>}
    </address>
    {block.mapEmbedUrl && <iframe className="vb-map" loading="lazy" src={block.mapEmbedUrl} title="Карта проезда" />}
  </Section>
)

const BookingRenderer: Renderer = (block) => {
  const href = getBookingHref(block.yclientsUrl || process.env.NEXT_PUBLIC_YCLIENTS_URL)
  const configured = !href.includes('#booking-setup')

  return (
    <Section block={block}>
      {configured ? (
        <a className="vb-button" href={href} rel="noreferrer" target="_blank">
          {block.buttonLabel || 'Забронировать'}
        </a>
      ) : (
        <p id="booking-setup">{block.fallbackText || 'Онлайн-запись скоро появится. Свяжитесь с нами по телефону.'}</p>
      )}
    </Section>
  )
}

export const blockRenderers: Record<string, Renderer> = {
  siteHero: SiteHeroRenderer,
  splitContent: SplitContentRenderer,
  featureGrid: CardGrid,
  gallery: GalleryRenderer,
  stays: CardGrid,
  mapPlan: MapPlanRenderer,
  activities: CardGrid,
  testimonials: TestimonialsRenderer,
  faq: FaqRenderer,
  promo: PromoRenderer,
  contacts: ContactsRenderer,
  booking: BookingRenderer,
}
