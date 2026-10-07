import { expect, test } from './fixtures';
import sample from '../sample-project.json' with { type: 'json' };
import AxeBuilder from '@axe-core/playwright';
import { migrateDocument } from '../src/domain/migrations';
import { createBlock } from '../src/domain/factories';

test('cross-episode search finds private content and moves keyboard focus to its editor on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const doc = migrateDocument(sample);
  doc.episodes.push({
    ...doc.episodes[0],
    id: 'ep_search',
    title: '再会章',
    slug: 'search',
    order: 2,
    blocks: [
      {
        ...doc.episodes[0].blocks[0],
        id: 'memo_search',
        type: 'memo',
        text: '星舟の秘密',
        hidden: true,
      },
      createBlock('divider', { note: '場面メモの目印' }),
    ],
  });
  await page.goto('/#/import');
  await page.getByLabel('JSONファイル').setInputFiles({
    name: 'search.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(doc)),
  });
  await page.getByRole('button', { name: '1作品をインポート' }).click();
  await page.getByRole('button', { name: '作品内を検索', exact: true }).click();
  await page.getByRole('searchbox', { name: '検索語' }).fill('星舟');
  const dialog = page.getByRole('dialog', { name: '作品内を検索' });
  await expect(dialog).toContainText('1件見つかりました');
  await expect(dialog).toContainText('非公開メモ');
  await page.screenshot({ path: test.info().outputPath('search-mobile.png') });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await dialog.getByRole('button', { name: /星舟の秘密/ }).click();
  await expect(page.getByLabel('メモ本文')).toBeFocused();
  await expect(
    page.getByRole('heading', { name: '再会章', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '作品内を検索', exact: true }).click();
  await page.getByRole('searchbox').fill('再会章');
  await dialog.getByRole('button', { name: /エピソードタイトル/ }).click();
  await expect(
    page.getByRole('heading', { name: '再会章', exact: true }),
  ).toBeFocused();
  await page.getByRole('button', { name: '作品内を検索', exact: true }).click();
  await page.getByRole('searchbox').fill('場面メモの目印');
  await dialog.getByRole('button', { name: /場面メモの目印/ }).click();
  await expect(
    page.getByTestId('block').nth(1).getByLabel('区切りの種類'),
  ).toBeFocused();
  await page.getByRole('button', { name: '作品内を検索', exact: true }).click();
  await page.getByRole('searchbox').fill('存在しない文章');
  await expect(dialog).toContainText('一致する内容はありません');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '作品内を検索', exact: true }),
  ).toBeFocused();
});
