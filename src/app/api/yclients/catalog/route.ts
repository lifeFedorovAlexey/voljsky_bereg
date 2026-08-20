import { NextRequest } from 'next/server'

import { getYclientsRuntime, yclientsGet } from '@/modules/booking/yclientsServer'

type Company = {
  address?: string
  city?: string
  id?: number
  public_title?: string
  title?: string
}

type Service = {
  active?: number
  category_id?: number
  id?: number
  price_max?: number
  price_min?: number
  seance_length?: number
  title?: string
}

type Staff = {
  bookable?: boolean | number
  id?: number
  name?: string
  seance_date?: string | number
  specialization?: string
}

type BookingDates = {
  booking_dates?: string[]
  booking_days?: Record<string, string[]>
  working_dates?: string[]
  working_days?: Record<string, string[]>
}

const PUBLIC_BOOKING_ERROR = 'Сейчас онлайн-запись недоступна. Позвоните нам, и мы поможем выбрать дату.'

const jsonError = () =>
  Response.json(
    { error: PUBLIC_BOOKING_ERROR },
    { status: 503 },
  )

export async function GET(request: NextRequest) {
  try {
    const { companyId, demo } = await getYclientsRuntime()
    const params = request.nextUrl.searchParams
    const serviceId = params.get('serviceId')
    const staffId = params.get('staffId')
    const date = params.get('date')
    const query = new URLSearchParams()

    if (serviceId && /^\d+$/.test(serviceId)) query.set('service_ids[]', serviceId)
    if (staffId && /^\d+$/.test(staffId)) query.set('staff_id', staffId)
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) query.set('date', date)

    const suffix = query.toString() ? `?${query.toString()}` : ''
    const [company, services, staff, dates] = await Promise.all([
      yclientsGet<Company>(`/api/v1/company/${companyId}/`),
      yclientsGet<{ services?: Service[] }>(`/api/v1/book_services/${companyId}${suffix}`),
      yclientsGet<Staff[]>(`/api/v1/book_staff/${companyId}${suffix}`),
      yclientsGet<BookingDates>(`/api/v1/book_dates/${companyId}${suffix}`),
    ])

    return Response.json({
      company: {
        address: company?.address || null,
        city: company?.city || null,
        id: company?.id || companyId,
        title: company?.public_title || company?.title || null,
      },
      dates: {
        bookingDates: dates?.booking_dates || [],
        workingDates: dates?.working_dates || [],
      },
      demo,
      services: (services?.services || []).map(({ active, category_id, id, price_max, price_min, seance_length, title }) => ({
        active,
        categoryId: category_id,
        id,
        priceMax: price_max,
        priceMin: price_min,
        seanceLength: seance_length,
        title,
      })),
      staff: (staff || []).map(({ bookable, id, name, seance_date, specialization }) => ({
        bookable,
        id,
        name,
        seanceDate: seance_date,
        specialization,
      })),
    })
  } catch {
    return jsonError()
  }
}
