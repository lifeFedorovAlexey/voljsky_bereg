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
  description = 'Даты и доступность открываются в форме YCLIENTS.',
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
        const dates = data.dates?.bookingDates || []
        setCatalog({ ...data, services, staff })
        setSelectedServiceId(String(services[0]?.id || ''))
        setSelectedStaffId(String(staff[0]?.id || ''))
        setSelectedDate(dates[0] || '')
        setDatePage(0)
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить YCLIENTS.')
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
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить свободное время.')
    } finally {
      setSlotsLoading(false)
    }
  }

  const visibleServices = (catalog?.services || [])
    .filter((service) => (service.title || '').toLocaleLowerCase().includes(serviceQuery.toLocaleLowerCase()))
    .slice(0, 24)
  const visibleStaff = (catalog?.staff || [])
    .filter((person) => (person.name || '').toLocaleLowerCase().includes(staffQuery.toLocaleLowerCase()))
    .slice(0, 24)
  const visibleDates = catalog?.dates?.bookingDates || []
  const datePageCount = Math.max(1, Math.ceil(visibleDates.length / PICKER_PAGE_SIZE))
  const visibleDatePage = visibleDates.slice(datePage * PICKER_PAGE_SIZE, (datePage + 1) * PICKER_PAGE_SIZE)
  const slotPageCount = Math.max(1, Math.ceil(slots.length / PICKER_PAGE_SIZE))
  const visibleSlotPage = slots.slice(slotPage * PICKER_PAGE_SIZE, (slotPage + 1) * PICKER_PAGE_SIZE)
  const selectedService = catalog?.services.find((service) => String(service.id) === selectedServiceId)
  const selectedStaff = catalog?.staff.find((person) => String(person.id) === selectedStaffId)

  function toggleStep(step: BookingStep) {
    setActiveStep(step)
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
        aria-describedby="yclients-booking-dialog-description"
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
              <p id="yclients-booking-dialog-description">
                {nativeFlow ? 'Выберите услугу, специалиста и подходящее время.' : description}
              </p>
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
                  <p className="vb-booking-form__source">
                    Онлайн-запись{catalog.company?.title ? ` · ${catalog.company.title}` : ''}
                  </p>
                  <div className="vb-booking-step-list">
                    <button aria-controls="booking-step-service" aria-expanded={activeStep === 'service'} className={`vb-booking-step${activeStep === 'service' ? ' is-active' : ''}`} onClick={() => toggleStep('service')} type="button">
                      <span aria-hidden="true" className="vb-booking-step__icon">☷</span>
                      <span className="vb-booking-step__copy"><strong>Выбрать услугу</strong><small>{selectedService ? serviceLabel(selectedService) : 'Услуга пока не выбрана'}</small></span>
                      <span aria-hidden="true" className="vb-booking-step__arrow">›</span>
                    </button>
                    {activeStep === 'service' && <div className="vb-booking-step__panel" id="booking-step-service">
                      <label><span>Поиск услуги</span><input onChange={(event) => setServiceQuery(event.target.value)} placeholder="Найти услугу" type="search" value={serviceQuery} /></label>
                      <div aria-label="Доступные услуги" className="vb-booking-choice-list" role="listbox">
                        {visibleServices.length > 0 ? visibleServices.slice(0, PICKER_PAGE_SIZE).map((service) => <button aria-selected={String(service.id) === selectedServiceId} className={`vb-booking-choice${String(service.id) === selectedServiceId ? ' is-selected' : ''}`} key={service.id} onClick={() => { setSelectedServiceId(String(service.id)); setActiveStep('staff') }} role="option" type="button">
                          <span className="vb-booking-choice__copy"><strong>{service.title || `Услуга YCLIENTS #${service.id || ''}`}</strong><small>{service.seanceLength ? `${service.seanceLength} мин` : 'Доступно для записи'}</small></span>
                          <span className="vb-booking-choice__meta">{service.priceMin && service.priceMin > 0 ? `от ${service.priceMin.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}</span>
                        </button>) : <p className="vb-booking-choice-list__empty">Ничего не найдено. Попробуйте другой запрос.</p>}
                      </div>
                    </div>}

                    <button aria-controls="booking-step-staff" aria-expanded={activeStep === 'staff'} className={`vb-booking-step${activeStep === 'staff' ? ' is-active' : ''}`} onClick={() => toggleStep('staff')} type="button">
                      <span aria-hidden="true" className="vb-booking-step__icon">♧</span>
                      <span className="vb-booking-step__copy"><strong>Выбрать специалиста</strong><small>{selectedStaff?.name || 'Ресурс пока не выбран'}</small></span>
                      <span aria-hidden="true" className="vb-booking-step__arrow">›</span>
                    </button>
                    {activeStep === 'staff' && <div className="vb-booking-step__panel" id="booking-step-staff">
                      <label><span>Поиск специалиста</span><input onChange={(event) => setStaffQuery(event.target.value)} placeholder="Найти сотрудника" type="search" value={staffQuery} /></label>
                      <div aria-label="Доступные специалисты и ресурсы" className="vb-booking-choice-list" role="listbox">
                        {visibleStaff.length > 0 ? visibleStaff.slice(0, PICKER_PAGE_SIZE).map((person) => <button aria-selected={String(person.id) === selectedStaffId} className={`vb-booking-choice${String(person.id) === selectedStaffId ? ' is-selected' : ''}`} key={person.id} onClick={() => { setSelectedStaffId(String(person.id)); setActiveStep('datetime') }} role="option" type="button">
                          <span className="vb-booking-choice__copy"><strong>{person.name || `Ресурс #${person.id}`}</strong><small>{person.specialization || 'Доступный ресурс'}</small></span>
                          <span aria-hidden="true" className="vb-booking-choice__check">{String(person.id) === selectedStaffId ? '✓' : ''}</span>
                        </button>) : <p className="vb-booking-choice-list__empty">Ничего не найдено. Попробуйте другой запрос.</p>}
                      </div>
                    </div>}

                    <button aria-controls="booking-step-datetime" aria-expanded={activeStep === 'datetime'} className={`vb-booking-step${activeStep === 'datetime' ? ' is-active' : ''}`} onClick={() => toggleStep('datetime')} type="button">
                      <span aria-hidden="true" className="vb-booking-step__icon">▦</span>
                      <span className="vb-booking-step__copy"><strong>Выбрать дату и время</strong><small>{selectedSlot ? `${formatDate(selectedDate)} · ${selectedSlot}` : selectedDate ? formatDate(selectedDate) : 'Дата пока не выбрана'}</small></span>
                      <span aria-hidden="true" className="vb-booking-step__arrow">›</span>
                    </button>
                    {activeStep === 'datetime' && <div className="vb-booking-step__panel" id="booking-step-datetime">
                      <div className="vb-booking-date-picker"><div className="vb-booking-picker-toolbar"><span className="vb-booking-date-picker__label">Дата</span><span>{datePage + 1} / {datePageCount}</span></div><div aria-label="Доступные даты" className="vb-booking-date-list" role="listbox">
                        {visibleDatePage.map((date) => <button aria-selected={date === selectedDate} className={`vb-booking-date${date === selectedDate ? ' is-selected' : ''}`} key={date} onClick={() => setSelectedDate(date)} role="option" type="button">{formatDate(date)}</button>)}
                      </div><div className="vb-booking-picker-nav"><button aria-label="Предыдущие даты" disabled={datePage === 0} onClick={() => setDatePage((page) => Math.max(0, page - 1))} type="button">Назад</button><button aria-label="Следующие даты" disabled={datePage >= datePageCount - 1} onClick={() => setDatePage((page) => Math.min(datePageCount - 1, page + 1))} type="button">Дальше</button></div></div>
                      <button className="vb-button vb-booking-form__submit" disabled={slotsLoading || !selectedDate || !selectedServiceId || !selectedStaffId} onClick={loadSlots} type="button">{slotsLoading && <span aria-hidden="true" className="vb-booking-spinner vb-booking-spinner--button" />}{slotsLoading ? 'Проверяем…' : 'Показать свободное время'}</button>
                      {slots.length > 0 && <div className="vb-booking-form__slots" aria-label="Свободное время">
                        <div className="vb-booking-form__slots-heading"><p>Свободное время</p><span>{slotPage + 1} / {slotPageCount}</span></div>
                        <div>{visibleSlotPage.map((slot, index) => { const value = slot.datetime || slot.time || String(index); return <button aria-pressed={selectedSlot === value} className={selectedSlot === value ? 'is-selected' : ''} key={value} onClick={() => setSelectedSlot(value)} type="button">{slot.time || slot.datetime}</button> })}</div>
                        <div className="vb-booking-picker-nav"><button aria-label="Предыдущие варианты времени" disabled={slotPage === 0} onClick={() => setSlotPage((page) => Math.max(0, page - 1))} type="button">Назад</button><button aria-label="Следующие варианты времени" disabled={slotPage >= slotPageCount - 1} onClick={() => setSlotPage((page) => Math.min(slotPageCount - 1, page + 1))} type="button">Дальше</button></div>
                      </div>}
                      {selectedSlot && <p className="vb-booking-form__demo-note" role="status">Демо-режим: слот выбран, запись не создаётся.</p>}
                      {hasCheckedAvailability && !slotsLoading && slots.length === 0 && <p className="vb-booking-form__hint">На выбранные параметры свободного времени нет.</p>}
                    </div>}
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