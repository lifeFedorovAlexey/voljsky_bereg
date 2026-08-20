import { NextRequest } from 'next/server'

import { getYclientsRuntime, yclientsGet } from '@/modules/booking/yclientsServer'

const PUBLIC_BOOKING_ERROR = 'Сейчас онлайн-запись недоступна. Позвоните нам, и мы поможем выбрать дату.'

type Slot = {
  datetime?: string
  seance_length?: number
  time?: string
}

export async function GET(request: NextRequest) {
  try {
    const { companyId } = await getYclientsRuntime()
    const params = request.nextUrl.searchParams
    const date = params.get('date')
    const serviceId = params.get('serviceId')
    const staffId = params.get('staffId') || '0'

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ error: 'Не удалось проверить выбранную дату.' }, { status: 400 })
    }
    if (!/^\d+$/.test(staffId) || (serviceId && !/^\d+$/.test(serviceId))) {
      return Response.json({ error: 'Не удалось проверить параметры записи.' }, { status: 400 })
    }

    const query = new URLSearchParams()
    if (serviceId) query.set('service_ids[]', serviceId)
    const data = await yclientsGet<Slot[]>(
      `/api/v1/book_times/${companyId}/${staffId}/${date}?${query.toString()}`,
    )

    return Response.json({
      date,
      slots: (data || []).map(({ datetime, seance_length, time }) => ({ datetime, seanceLength: seance_length, time })),
    })
  } catch {
    return Response.json({ error: PUBLIC_BOOKING_ERROR }, { status: 503 })
  }
}
