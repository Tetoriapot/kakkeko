import { expect, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
test.use({ viewport: { width: 1440, height: 1000 } });
test('project duplicate/delete confirmation and full backup are functional', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
  await page.getByRole('button', { name: '作品一覧に戻る' }).click();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.locator('.project-card').first().locator('summary').click();
  await page
    .locator('.project-card')
    .first()
    .getByRole('button', { name: '複製', exact: true })
    .click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  const copy = page.locator('.project-card').filter({
    has: page.getByRole('heading', {
      name: 'わくわく因習村探検記 のコピー',
      exact: true,
    }),
  });
  await copy.locator('summary').click();
  await copy.getByRole('button', { name: '削除', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '削除の確認' })).toBeVisible();
  await page.getByRole('button', { name: 'キャンセル', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await copy.getByRole('button', { name: '削除', exact: true }).click();
  await page.getByRole('button', { name: '削除する', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByRole('link', { name: '設定', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '全データJSONバックアップ' }).click();
  expect((await download).suggestedFilename()).toBe('kakkeko-backup.json');
  await page.getByLabel('外観').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.getByRole('button', { name: '全データ削除', exact: true }).click();
  await page.getByRole('button', { name: '削除する', exact: true }).click();
  await page.getByRole('link', { name: '作品一覧', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '最初の会話作品をつくる' }),
  ).toBeVisible();
});
test('theme switching, remaining export formats and toolbar operations work', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
  const renderer = page.getByTestId('episode-renderer');
  for (const id of [
    'minimal-log',
    'aa-classic',
    'trpg-replay',
    'magazine-talk',
    'default-bubble',
  ]) {
    await page
      .locator('.project-settings')
      .getByLabel('テーマ')
      .selectOption(id);
    await expect(renderer).toHaveClass(new RegExp(`theme-${id}`));
  }
  const blocks = page.getByTestId('block');
  await blocks
    .first()
    .getByRole('button', { name: 'ブロックを複製', exact: true })
    .click();
  await expect(blocks).toHaveCount(4);
  await blocks
    .nth(1)
    .getByRole('button', { name: 'ブロックを削除', exact: true })
    .click();
  await expect(blocks).toHaveCount(3);
  await expect(
    page.getByRole('status').filter({ hasText: 'Undoで元に戻せます' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '書き出し', exact: true }).click();
  await page.getByLabel('書き出し形式', { exact: true }).selectOption('txt');
  let download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ダウンロード', exact: true }).click();
  expect((await download).suggestedFilename()).toContain('.txt');
  await page.getByLabel('書き出し形式', { exact: true }).selectOption('html');
  await page.getByLabel('HTML形式').selectOption('zip');
  download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ダウンロード', exact: true }).click();
  expect((await download).suggestedFilename()).toContain('.zip');
  await page
    .getByRole('button', { name: '閉じる', exact: true })
    .last()
    .click();
  await page.getByRole('button', { name: 'プレビューを拡大' }).click();
  await expect(
    page.getByRole('dialog', { name: '閲覧プレビュー' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('skip link stays on the current route and missing routes are recoverable', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '本文へ移動' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  expect(page.url()).not.toContain('#main');
  await page.goto('/#/missing');
  await expect(
    page.getByRole('heading', { name: 'ページが見つかりません' }),
  ).toBeVisible();
  await page.getByRole('link', { name: '作品一覧へ' }).click();
  await expect(
    page.getByRole('heading', { name: '作品一覧', exact: true }),
  ).toBeVisible();
});
