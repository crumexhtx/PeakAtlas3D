import { expect, test } from '@playwright/test'

test.describe('peak search', () => {
  test('searching another peak replaces the previous query', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('peakatlas.hint.world.v3', '1')
    })

    await page.goto('/')
    const search = page.getByRole('combobox', { name: /search peaks/i })
    await search.fill('rainier')
    await page.getByRole('option', { name: /rainier/i }).click()
    await expect(page).toHaveURL(/\/peak\/rainier/)
    await expect(search).toHaveValue(/Rainier/i)

    await search.click()
    await expect(page.getByRole('listbox')).toHaveCount(0)
    await search.pressSequentially('fuji', { delay: 20 })
    await page.getByRole('option', { name: /fuji/i }).click()
    await expect(page).toHaveURL(/\/peak\/fuji/)
    await expect(search).toHaveValue(/Fuji/i)
    await expect(page).not.toHaveURL(/country=/)
  })
})
