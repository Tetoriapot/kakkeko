import { expect, test } from './fixtures';

test('new creator follows the guide, dismisses it, and can reopen it from Help', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '＋ 新規作品', exact: true }).click();
  await page.getByLabel('作品タイトル', { exact: true }).fill('ガイドの作品');
  await page.getByRole('button', { name: '作品を作成', exact: true }).click();
  const guide = page.getByRole('region', { name: 'はじめての作品ガイド' });
  await expect(guide).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('guide-mobile.png') });
  await guide.getByRole('button', { name: 'キャラクターを登録する' }).click();
  await page.getByLabel('キャラクター名', { exact: true }).fill('あおい');
  await page
    .getByRole('button', { name: 'キャラクターを登録', exact: true })
    .click();
  await guide.getByRole('button', { name: 'セリフを入力する' }).click();
  const input = page.getByLabel('セリフ本文');
  await expect(input).toBeFocused();
  await input.fill('はじめての会話');
  await guide.getByRole('button', { name: 'プレビューで確認する' }).click();
  await expect(page.getByTestId('episode-renderer')).toContainText(
    'はじめての会話',
  );
  await page
    .getByRole('navigation', { name: '編集画面切替' })
    .getByRole('button', { name: '編集', exact: true })
    .click();
  await expect(guide).toContainText('初期設定が完了しました。');
  await guide.getByRole('button', { name: 'ガイドを終了' }).click();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('.save-status')).toContainText('保存済み');
  await page.reload();
  await expect(input).toHaveValue('はじめての会話');
  await expect(guide).toHaveCount(0);
  await page
    .getByRole('navigation', { name: '編集画面切替' })
    .getByRole('button', { name: 'プレビュー', exact: true })
    .click();
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await page.getByRole('button', { name: '操作ガイドを開く' }).click();
  await expect(guide).toBeVisible();
  await expect(guide).toBeInViewport();
});
