import config from '@payload-config'
import { getPayload } from 'payload'

type YclientsSettings = {
  accountLabel?: string | null
  companyId?: number | null
  enabled?: boolean | null
  mode?: 'native-readonly' | 'hosted-fallback' | null
}

type YclientsResponse<T> = {
  data?: T
  meta?: { message?: string }
  success?: boolean
}

const API_BASE_URL = 'https://api.yclients.com'
const YCLIENTS_CONFIGURATION_ERROR = 'Booking service configuration is unavailable.'

export async function getYclientsRuntime(): Promise<{
  demo: boolean
  settings: YclientsSettings
  companyId: number
}> {
  const payload = await getPayload({ config })
  const settings = (await payload.findGlobal({
    slug: 'yclientsSettings',
    depth: 0,
    overrideAccess: true,
  })) as YclientsSettings

  const demo = process.env.YCLIENTS_DEMO_MODE === 'true'
  const demoCompanyId = Number(process.env.YCLIENTS_DEMO_COMPANY_ID)
  const companyId = demo && Number.isInteger(demoCompanyId) && demoCompanyId > 0
    ? demoCompanyId
    : Number(settings.companyId)

  if (!demo && !settings.enabled) throw new Error('YCLIENTS native-интеграция выключена в админке.')
  if (!companyId || companyId < 1) {
    throw new Error('В админке не указан реальный company_id YCLIENTS.')
  }
  if (!process.env.YCLIENTS_PARTNER_TOKEN || !process.env.YCLIENTS_USER_TOKEN) {
    throw new Error(YCLIENTS_CONFIGURATION_ERROR)
  }

  return { companyId, demo, settings }
}

export async function yclientsGet<T>(path: string): Promise<T> {
  const partnerToken = process.env.YCLIENTS_PARTNER_TOKEN
  const userToken = process.env.YCLIENTS_USER_TOKEN

  if (!partnerToken || !userToken) {
    throw new Error(YCLIENTS_CONFIGURATION_ERROR)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.yclients.v2+json',
      Authorization: `Bearer ${partnerToken}, User ${userToken}`,
    },
  })
  const body = (await response.json()) as YclientsResponse<T>

  if (!response.ok || body.success === false) {
    throw new Error(body.meta?.message || `YCLIENTS API вернул HTTP ${response.status}.`)
  }

  return body.data as T
}
