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

  const sheet = page.locator('.details-sheet')
  await expect(sheet).toHaveClass(/is-expanded/)

  // Expanded sheet stays within a viewport budget; dossier scrolls inside.
  const metrics = await page.evaluate(() => {
    const el = document.querySelector('.details-sheet') as HTMLElement | null
    const scroller = document.querySelector(
      '.details-sheet-body-inner',
    ) as HTMLElement | null
    if (!el || !scroller) return null
    return {
      sheetHeight: el.getBoundingClientRect().height,
      viewport: window.innerHeight,
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
    }
  })
  expect(metrics).not.toBeNull()
  expect(metrics!.sheetHeight).toBeLessThanOrEqual(metrics!.viewport * 0.75)
  expect(metrics!.scrollHeight).toBeGreaterThan(metrics!.clientHeight)
})
