'use client'

import React, { useEffect, useRef, useState } from 'react'

type Service = {
  active?: number
  id?: number
  priceMax?: number
  priceMin?: number
  seanceLength?: number | null
  title?: string
}

type Staff = {
  bookable?: boolean | number
  id?: number
  name?: string
  specialization?: string
}

type Catalog = {
  company?: { title?: string | null }
  dates?: { bookingDates?: string[] }
  demo?: boolean
  services: Service[]
  staff: Staff[]
}

type Slot = {
  datetime?: string
  seanceLength?: number
  time?: string
}

type BookingStep = 'service' | 'staff' | 'datetime'

const PICKER_PAGE_SIZE = 6
const CHOICE_PAGE_SIZE = 5
const PUBLIC_BOOKING_ERROR = 'Сейчас онлайн-запись недоступна. Позвоните нам, и мы поможем выбрать дату.'

type YclientsBookingDialogProps = {
  href?: string
  title?: string
  description?: string
  buttonLabel?: string
  nativeFlow?: boolean
}

const formatDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  }).format(date)
}

const serviceLabel = (service: Service) => {
  const price = service.priceMin && service.priceMin > 0 ? ` · от ${service.priceMin.toLocaleString('ru-RU')} ₽` : ''
  return `${service.title || `Услуга YCLIENTS #${service.id || ''}`}${price}`
}

export function YclientsBookingDialog({
  href,
  title = 'Выберите удобное время отдыха',
  description = '',
  buttonLabel = 'Забронировать',
  nativeFlow = false,
}: YclientsBookingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousBodyOverflowRef = useRef('')
  const [isOpen, setIsOpen] = useState(false)
  const [frameLoaded, setFrameLoaded] = useState(false)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [serviceQuery, setServiceQuery] = useState('')
  const [staffQuery, setStaffQuery] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false)
  const [activeStep, setActiveStep] = useState<BookingStep>('service')
  const [servicePage, setServicePage] = useState(0)
  const [staffPage, setStaffPage] = useState(0)
  const [datePage, setDatePage] = useState(0)
  const [slotPage, setSlotPage] = useState(0)

  useEffect(() => {
    return () => {
      document.body.style.overflow = previousBodyOverflowRef.current
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !nativeFlow || catalog) return

    let cancelled = false
    setCatalogLoading(true)
    setError('')

    fetch('/api/yclients/catalog', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Не удалось загрузить доступность YCLIENTS.')
        return data as Catalog
      })
      .then((data) => {
        if (cancelled) return
        const services = data.services.filter((service) => service.active !== 0)
        const staff = data.staff.filter((person) => Boolean(person.bookable))
        setCatalog({ ...data, services, staff })
        setSelectedServiceId('')
        setSelectedStaffId('')
        setSelectedDate('')
        setDatePage(0)
      })
      .catch(() => {
        if (!cancelled) setError(PUBLIC_BOOKING_ERROR)
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [catalog, isOpen, nativeFlow])

  useEffect(() => {
    setSlots([])
    setSelectedSlot('')
    setHasCheckedAvailability(false)
    setSlotPage(0)
  }, [selectedDate, selectedServiceId, selectedStaffId])

  function openDialog() {
    setFrameLoaded(false)
    setIsOpen(true)
    setActiveStep('service')
    setDatePage(0)
    setSlotPage(0)
    previousBodyOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.showModal()
    requestAnimationFrame(() => closeRef.current?.focus())
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  function handleDialogClose() {
    document.body.style.overflow = previousBodyOverflowRef.current
    setIsOpen(false)
    setFrameLoaded(false)
    triggerRef.current?.focus()
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeDialog()
  }

  async function loadSlots() {
    if (!selectedDate || !selectedServiceId || !selectedStaffId) return
    setSlotsLoading(true)
    setError('')
    setSelectedSlot('')
    setHasCheckedAvailability(true)

    try {
      const params = new URLSearchParams({ date: selectedDate, serviceId: selectedServiceId, staffId: selectedStaffId })
      const response = await fetch(`/api/yclients/availability?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Не удалось загрузить свободное время.')
      setSlots(Array.isArray(data.slots) ? data.slots : [])
      setSlotPage(0)
    } catch {
      setError(PUBLIC_BOOKING_ERROR)
    } finally {
      setSlotsLoading(false)
    }
  }

  const filteredServices = (catalog?.services || [])
    .filter((service) => (service.title || '').toLocaleLowerCase().includes(serviceQuery.toLocaleLowerCase()))
    .slice(0, 24)
  const filteredStaff = (catalog?.staff || [])
    .filter((person) => (person.name || '').toLocaleLowerCase().includes(staffQuery.toLocaleLowerCase()))
    .slice(0, 24)
  const servicePageCount = Math.max(1, Math.ceil(filteredServices.length / CHOICE_PAGE_SIZE))
  const staffPageCount = Math.max(1, Math.ceil(filteredStaff.length / CHOICE_PAGE_SIZE))
  const visibleServicePage = filteredServices.slice(servicePage * CHOICE_PAGE_SIZE, (servicePage + 1) * CHOICE_PAGE_SIZE)
  const visibleStaffPage = filteredStaff.slice(staffPage * CHOICE_PAGE_SIZE, (staffPage + 1) * CHOICE_PAGE_SIZE)
  const visibleDates = catalog?.dates?.bookingDates || []
  const datePageCount = Math.max(1, Math.ceil(visibleDates.length / PICKER_PAGE_SIZE))
  const visibleDatePage = visibleDates.slice(datePage * PICKER_PAGE_SIZE, (datePage + 1) * PICKER_PAGE_SIZE)
  const slotPageCount = Math.max(1, Math.ceil(slots.length / PICKER_PAGE_SIZE))
  const visibleSlotPage = slots.slice(slotPage * PICKER_PAGE_SIZE, (slotPage + 1) * PICKER_PAGE_SIZE)
  const selectedService = catalog?.services.find((service) => String(service.id) === selectedServiceId)
  const selectedStaff = catalog?.staff.find((person) => String(person.id) === selectedStaffId)

  function goToPreviousStep() {
    setActiveStep((step) => step === 'datetime' ? 'staff' : 'service')
  }

  function goToNextStep() {
    if (activeStep === 'service' && selectedServiceId) setActiveStep('staff')
    if (activeStep === 'staff' && selectedStaffId) setActiveStep('datetime')
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="vb-button"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        {buttonLabel}
      </button>

      <dialog
        aria-describedby={description ? 'yclients-booking-dialog-description' : undefined}
        aria-labelledby="yclients-booking-dialog-title"
        className="vb-booking-dialog"
        onClick={handleBackdropClick}
        onClose={handleDialogClose}
        ref={dialogRef}
      >
        <div className="vb-booking-dialog__surface">
          <header className="vb-booking-dialog__header">
            <div>
              <h3 id="yclients-booking-dialog-title">{title}</h3>
              {description && <p id="yclients-booking-dialog-description">{description}</p>}
            </div>
            <button
              aria-label="Закрыть форму бронирования"
              className="vb-booking-dialog__close"
              onClick={closeDialog}
              ref={closeRef}
              type="button"
            >
              Закрыть
            </button>
          </header>

          {nativeFlow ? (
            <div className="vb-booking-dialog__native" aria-busy={catalogLoading || slotsLoading}>
              {catalogLoading && <div className="vb-booking-dialog__loading-state" role="status"><span aria-hidden="true" className="vb-booking-spinner" /><span>Загружаем доступные даты и услуги…</span></div>}
              {error && <p className="vb-booking-dialog__error" role="alert">{error}</p>}
              {catalog && !error && (
                <div className="vb-booking-steps">
                  <div aria-label="Этапы записи" className="vb-booking-progress" role="list">
                    <div className={`vb-booking-progress__item${activeStep === 'service' ? ' is-active' : ''}${selectedServiceId ? ' is-complete' : ''}`} role="listitem"><span>1</span><strong>Услуга</strong><small>{selectedService ? serviceLabel(selectedService) : 'Не выбрана'}</small></div>
                    <div className={`vb-booking-progress__item${activeStep === 'staff' ? ' is-active' : ''}${selectedStaffId ? ' is-complete' : ''}`} role="listitem"><span>2</span><strong>Специалист</strong><small>{selectedStaff?.name || 'Не выбран'}</small></div>
                    <div className={`vb-booking-progress__item${activeStep === 'datetime' ? ' is-active' : ''}${selectedDate ? ' is-complete' : ''}`} role="listitem"><span>3</span><strong>Дата и время</strong><small>{selectedSlot ? `${formatDate(selectedDate)} · ${selectedSlot}` : selectedDate ? formatDate(selectedDate) : 'Не выбраны'}</small></div>
                  </div>

                  {activeStep === 'service' && <div className="vb-booking-step__panel" id="booking-step-service">
                    <div className="vb-booking-step__heading"><strong>Выберите услугу</strong><span>Шаг 1 из 3</span></div>
                    <label><span className="vb-sr-only">Поиск услуги</span><input onChange={(event) => { setServiceQuery(event.target.value); setServicePage(0) }} placeholder="Найти услугу" type="search" value={serviceQuery} /></label>
                    <div aria-label="Доступные услуги" className="vb-booking-choice-list" role="listbox">
                      {visibleServicePage.length > 0 ? visibleServicePage.map((service) => <button aria-selected={String(service.id) === selectedServiceId} className={`vb-booking-choice${String(service.id) === selectedServiceId ? ' is-selected' : ''}`} key={service.id} onClick={() => { setSelectedServiceId(String(service.id)); setActiveStep('staff') }} role="option" type="button">
                        <span className="vb-booking-choice__copy"><strong>{service.title || 'Услуга'}</strong><small>{service.seanceLength ? `${service.seanceLength} мин` : 'Доступно для записи'}</small></span>
                        <span className="vb-booking-choice__meta">{service.priceMin && service.priceMin > 0 ? `от ${service.priceMin.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}</span>
                      </button>) : <p className="vb-booking-choice-list__empty">Ничего не найдено. Попробуйте другой запрос.</p>}
                    </div>
                    <div className="vb-booking-picker-toolbar"><span>Услуги {servicePage + 1} / {servicePageCount}</span><div className="vb-booking-picker-nav"><button disabled={servicePage === 0} onClick={() => setServicePage((page) => Math.max(0, page - 1))} type="button">Назад</button><button disabled={servicePage >= servicePageCount - 1} onClick={() => setServicePage((page) => Math.min(servicePageCount - 1, page + 1))} type="button">Дальше</button></div></div>
                  </div>}

                  {activeStep === 'staff' && <div className="vb-booking-step__panel" id="booking-step-staff">
                    <div className="vb-booking-step__heading"><strong>Выберите специалиста</strong><span>Шаг 2 из 3</span></div>
                    <label><span className="vb-sr-only">Поиск специалиста</span><input onChange={(event) => { setStaffQuery(event.target.value); setStaffPage(0) }} placeholder="Найти специалиста" type="search" value={staffQuery} /></label>
                    <div aria-label="Доступные специалисты и ресурсы" className="vb-booking-choice-list" role="listbox">
                      {visibleStaffPage.length > 0 ? visibleStaffPage.map((person) => <button aria-selected={String(person.id) === selectedStaffId} className={`vb-booking-choice${String(person.id) === selectedStaffId ? ' is-selected' : ''}`} key={person.id} onClick={() => { setSelectedStaffId(String(person.id)); setActiveStep('datetime') }} role="option" type="button">
                        <span className="vb-booking-choice__copy"><strong>{person.name || `Ресурс #${person.id}`}</strong><small>{person.specialization || 'Доступный ресурс'}</small></span>
                        <span aria-hidden="true" className="vb-booking-choice__check">{String(person.id) === selectedStaffId ? '✓' : ''}</span>
                      </button>) : <p className="vb-booking-choice-list__empty">Ничего не найдено. Попробуйте другой запрос.</p>}
                    </div>
                    <div className="vb-booking-picker-toolbar"><span>Специалисты {staffPage + 1} / {staffPageCount}</span><div className="vb-booking-picker-nav"><button disabled={staffPage === 0} onClick={() => setStaffPage((page) => Math.max(0, page - 1))} type="button">Назад</button><button disabled={staffPage >= staffPageCount - 1} onClick={() => setStaffPage((page) => Math.min(staffPageCount - 1, page + 1))} type="button">Дальше</button></div></div>
                  </div>}

                  {activeStep === 'datetime' && <div className="vb-booking-step__panel" id="booking-step-datetime">
                    <div className="vb-booking-step__heading"><strong>Выберите дату и время</strong><span>Шаг 3 из 3</span></div>
                    {!hasCheckedAvailability ? <>
                      <div className="vb-booking-date-picker"><div className="vb-booking-picker-toolbar"><span className="vb-booking-date-picker__label">Дата</span><span>{datePage + 1} / {datePageCount}</span></div><div aria-label="Доступные даты" className="vb-booking-date-list" role="listbox">
                        {visibleDatePage.map((date) => <button aria-selected={date === selectedDate} className={`vb-booking-date${date === selectedDate ? ' is-selected' : ''}`} key={date} onClick={() => setSelectedDate(date)} role="option" type="button">{formatDate(date)}</button>)}
                      </div><div className="vb-booking-picker-nav"><button aria-label="Предыдущие даты" disabled={datePage === 0} onClick={() => setDatePage((page) => Math.max(0, page - 1))} type="button">Назад</button><button aria-label="Следующие даты" disabled={datePage >= datePageCount - 1} onClick={() => setDatePage((page) => Math.min(datePageCount - 1, page + 1))} type="button">Дальше</button></div></div>
                      <button className="vb-button vb-booking-form__submit" disabled={slotsLoading || !selectedDate} onClick={loadSlots} type="button">{slotsLoading && <span aria-hidden="true" className="vb-booking-spinner vb-booking-spinner--button" />}{slotsLoading ? 'Проверяем…' : 'Показать свободное время'}</button>
                    </> : <>
                      <div className="vb-booking-date-summary"><span>Выбранная дата</span><strong>{formatDate(selectedDate)}</strong><button onClick={() => { setHasCheckedAvailability(false); setSlots([]); setSelectedSlot('') }} type="button">Изменить дату</button></div>
                      {slotsLoading && <div className="vb-booking-dialog__loading-state" role="status"><span aria-hidden="true" className="vb-booking-spinner" /><span>Проверяем свободное время…</span></div>}
                      {slots.length > 0 && <div className="vb-booking-form__slots" aria-label="Свободное время">
                        <div className="vb-booking-form__slots-heading"><p>Свободное время</p><span>{slotPage + 1} / {slotPageCount}</span></div>
                        <div>{visibleSlotPage.map((slot, index) => { const value = slot.datetime || slot.time || String(index); return <button aria-pressed={selectedSlot === value} className={selectedSlot === value ? 'is-selected' : ''} key={value} onClick={() => setSelectedSlot(value)} type="button">{slot.time || slot.datetime}</button> })}</div>
                        <div className="vb-booking-picker-nav"><button aria-label="Предыдущие варианты времени" disabled={slotPage === 0} onClick={() => setSlotPage((page) => Math.max(0, page - 1))} type="button">Назад</button><button aria-label="Следующие варианты времени" disabled={slotPage >= slotPageCount - 1} onClick={() => setSlotPage((page) => Math.min(page + 1, slotPageCount - 1))} type="button">Дальше</button></div>
                      </div>}
                      {!slotsLoading && hasCheckedAvailability && slots.length === 0 && <p className="vb-booking-form__hint">На выбранные параметры свободного времени нет.</p>}
                    </>}
                  </div>}

                  <div className="vb-booking-step-actions">
                    <button className="vb-booking-step-actions__back" disabled={activeStep === 'service'} onClick={goToPreviousStep} type="button">Назад</button>
                    {activeStep !== 'datetime' && <button className="vb-button" disabled={activeStep === 'service' ? !selectedServiceId : !selectedStaffId} onClick={goToNextStep} type="button">Дальше</button>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div aria-busy={!frameLoaded} className="vb-booking-dialog__frame-wrap">
              {!frameLoaded && <p className="vb-booking-dialog__loading" role="status">Загружаем форму бронирования…</p>}
              {isOpen && href && <iframe className="vb-booking-dialog__frame" onLoad={() => setFrameLoaded(true)} src={href} title="Форма онлайн-записи YCLIENTS" />}
            </div>
          )}

          {!nativeFlow && href && <footer className="vb-booking-dialog__footer"><a href={href} rel="noreferrer" target="_blank">Открыть форму в новой вкладке</a></footer>}
        </div>
      </dialog>
    </>
  )
}