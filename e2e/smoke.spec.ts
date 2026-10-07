import { expect, test } from './fixtures';
test('起動する', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '作品一覧' })).toBeVisible();
});
