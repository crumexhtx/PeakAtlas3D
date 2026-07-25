import { expect, test } from '@playwright/test'

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
})

test('collapsed peak tab expands on tap', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('peakatlas.hint.world.v2', '1')
  })

  await page.goto('/peak/rainier?country=USA')

  const skip = page.getByRole('button', { name: /^skip$/i })
  if (await skip.isVisible().catch(() => false)) {
    await skip.click()
  }

  const tab = page.locator('.details-sheet-tab')
  await expect(tab).toBeVisible({ timeout: 30_000 })
  await expect(tab).toHaveAttribute('aria-expanded', 'false')

  await tab.tap()
  await expect(tab).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.details-sheet-body')).toBeVisible()
})
