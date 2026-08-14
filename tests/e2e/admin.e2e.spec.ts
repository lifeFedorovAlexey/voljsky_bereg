import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    await expect(page.getByRole('heading', { name: 'Сайт «Иенево. Берег»' })).toBeVisible()
    await expect(page.locator('.before-dashboard__action')).toHaveCount(4)
    await expect(page.locator('.dashboard > .before-dashboard + div')).toBeHidden()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL(/\/admin\/collections\/users(\?.*)?$/)
    const listViewArtifact = page.locator('h1', { hasText: 'Администраторы' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('shows editorial page columns instead of the technical address', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages')
    const tableHead = page.locator('table thead')
    await expect(tableHead).toContainText('Название страницы')
    await expect(tableHead).toContainText('Статус')
    await expect(tableHead).not.toContainText('Адрес страницы')
  })

  test('does not expose Payload controls on the public site', async () => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('.admin-bar')).toHaveCount(0)
    await expect(page.locator('.vb-header')).toBeVisible()
    expect(await page.locator('.vb-header').evaluate((element) => element.getBoundingClientRect().top)).toBe(0)
  })

  test('can navigate to edit view', async () => {
    const response = await page.request.get('http://localhost:3000/api/pages?limit=1&depth=0')
    const { docs } = await response.json()
    expect(docs[0]?.id).toBeTruthy()
    await page.goto(`http://localhost:3000/admin/collections/pages/${docs[0].id}`)
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="title"]')
    await expect(editViewArtifact).toBeVisible()
  })

  test('keeps collection tables readable in the dark theme', async () => {
    await page.context().addCookies([
      { domain: 'localhost', name: 'payload-theme', path: '/', value: 'dark' },
    ])

    for (const collection of ['pages', 'media']) {
      await page.goto(`http://localhost:3000/admin/collections/${collection}`)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
      await expect(page.locator('table tbody tr').first()).toBeVisible()

      const lowContrast = await page.locator(
        'table tbody td, table tbody a, table thead th, .collection-list__header .btn',
      ).evaluateAll((elements) => {
        const parseRGB = (value: string) =>
          value.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [0, 0, 0]
        const luminance = (value: string) => {
          const [red, green, blue] = parseRGB(value).map((channel) => {
            const normalized = channel / 255
            return normalized <= 0.03928
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4
          })
          return 0.2126 * red + 0.7152 * green + 0.0722 * blue
        }
        const background = (element: Element) => {
          for (let current: Element | null = element; current; current = current.parentElement) {
            const color = getComputedStyle(current).backgroundColor
            if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color
          }
          return 'rgb(0, 0, 0)'
        }

        return elements.flatMap((element) => {
          const text = (element.textContent || '').trim()
          if (!text) return []
          const foreground = getComputedStyle(element).color
          const foregroundLuminance = luminance(foreground)
          const backgroundLuminance = luminance(background(element))
          const ratio =
            (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
            (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
          return ratio < 4.5 ? [{ ratio, text }] : []
        })
      })

      expect(lowContrast).toEqual([])
    }
  })
})
