import { expect, test, type Page } from '@playwright/test'

async function skipCinematic(page: Page) {
  const skip = page.getByRole('button', { name: /^skip$/i })
  if (await skip.isVisible().catch(() => false)) {
    await skip.click()
  }
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

async function expectOrbitMissesCompass(page: Page) {
  await skipCinematic(page)
  const orbit = page.getByRole('button', { name: /orbit around peak/i })
  const compass = page.locator('.maplibregl-ctrl-compass')
  await expect(orbit).toBeVisible({ timeout: 30_000 })
  await expect(compass).toBeVisible({ timeout: 30_000 })
  const orbitBox = await orbit.boundingBox()
  const compassBox = await compass.boundingBox()
  expect(orbitBox).not.toBeNull()
  expect(compassBox).not.toBeNull()
  expect(rectsOverlap(orbitBox!, compassBox!)).toBe(false)
}

test.describe('mobile peak controls 375×812', () => {
  test.use({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  })

  test('orbit button does not cover the compass', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('peakatlas.hint.world.v3', '1')
    })
    await page.goto('/peak/rainier')
    await expectOrbitMissesCompass(page)
  })

  test('globe loading fallback clears on Everest', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('peakatlas.hint.world.v3', '1')
    })
    await page.goto('/peak/everest')
    await expect(page.getByLabel('Loading 3D map')).toBeHidden({
      timeout: 30_000,
    })
  })
})

test.describe('mobile peak controls 800px', () => {
  test.use({
    viewport: { width: 800, height: 812 },
    hasTouch: true,
    isMobile: true,
  })

  test('orbit button does not cover the compass', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('peakatlas.hint.world.v3', '1')
    })
    await page.goto('/peak/rainier')
    await expectOrbitMissesCompass(page)
  })
})
