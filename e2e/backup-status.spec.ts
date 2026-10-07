import { expect, test } from './fixtures';

test('backup status tracks individual and full JSON exports, edits, reloads, and opt-in reminders', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
  const status = page.locator('.project-backup');
  await expect(status).toContainText('JSONバックアップ: 未出力');
  const download = page.waitForEvent('download');
  await status
    .getByRole('button', { name: 'JSONバックアップ', exact: true })
    .click();
  expect((await download).suggestedFilename()).toContain('.json');
  await expect(status).toContainText('最終JSON出力');
  await page
    .getByTestId('block')
    .first()
    .getByLabel('セリフ本文')
    .fill('出力後の変更');
  await expect(status).toContainText('出力後に変更あり');
  await page.getByRole('button', { name: '作品一覧に戻る' }).click();
  await expect(page.locator('.project-card')).toContainText('出力後に変更あり');
  await page.getByRole('link', { name: '設定', exact: true }).click();
  await expect(page.getByLabel('バックアップのリマインダー')).toHaveValue('0');
  await page.getByLabel('バックアップのリマインダー').selectOption('7');
  const full = page.waitForEvent('download');
  await page.getByRole('button', { name: '全データJSONバックアップ' }).click();
  expect((await full).suggestedFilename()).toBe('kakkeko-backup.json');
  await expect(page.getByText(/最終全作品JSON出力:/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('バックアップのリマインダー')).toHaveValue('7');
  await page.screenshot({
    path: test.info().outputPath('backup-settings.png'),
    fullPage: true,
  });
  await page.getByRole('link', { name: '作品一覧', exact: true }).click();
  await expect(page.locator('.project-card')).not.toContainText(
    '出力後に変更あり',
  );
  await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
  await expect(status).toContainText('バックアップの時期です');
});
