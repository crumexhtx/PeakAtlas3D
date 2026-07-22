import { expect, test } from '@playwright/test'

test.describe('atlas journey', () => {
  test('world → country → peak → skip → back keeps country', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('peakatlas.hint.world.v2', '1')
    })

    await page.goto('/')
    await expect(page.getByRole('combobox', { name: /search peaks/i })).toBeVisible()

    await page.goto('/?country=USA')
    await expect(
      page.getByRole('heading', { name: 'USA', exact: true }),
    ).toBeVisible()

    await page.goto('/peak/rainier?country=USA')
    await expect(page.getByRole('link', { name: /atlas/i }).first()).toBeVisible()

    const skip = page.getByRole('button', { name: /^skip$/i })
    // Cinematic may already have finished on slow CI; skip only if present.
    if (await skip.isVisible().catch(() => false)) {
      await skip.click()
    }

    await expect(page.getByRole('link', { name: /← atlas/i })).toBeVisible({
      timeout: 30_000,
    })

    await page.getByRole('link', { name: /← atlas/i }).click()
    await expect(page).toHaveURL(/country=USA/)
    await expect(
      page.getByRole('heading', { name: 'USA', exact: true }),
    ).toBeVisible()
  })
})
