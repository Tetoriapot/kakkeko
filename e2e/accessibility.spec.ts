import { expect, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
test('home and editor have no serious accessibility violations', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: '最初の会話作品をつくる' }),
  ).toBeVisible();
  const home = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(home.violations).toEqual([]);
  await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
  await expect(
    page.getByRole('button', { name: '書き出し', exact: true }),
  ).toBeVisible();
  const editor = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(editor.violations).toEqual([]);
});
