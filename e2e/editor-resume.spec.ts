import { expect, test } from './fixtures';
import sample from '../sample-project.json' with { type: 'json' };
import { migrateDocument } from '../src/domain/migrations';
import { createBlock } from '../src/domain/factories';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
test('mobile reload and reopening restore the episode and editing position without opening the keyboard', async ({
  page,
}) => {
  const doc = migrateDocument(sample);
  doc.episodes.push({
    ...doc.episodes[0],
    id: 'resume-episode',
    title: '続きの話',
    slug: 'resume',
    order: 2,
    blocks: Array.from({ length: 12 }, (_, i) =>
      createBlock('narration', { text: `長い原稿の段落 ${i + 1}` }),
    ),
  });
  await page.goto('/#/import');
  await page.getByLabel('JSONファイル').setInputFiles({
    name: 'resume.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(doc)),
  });
  await page.getByRole('button', { name: '1作品をインポート' }).click();
  await page
    .getByLabel('編集中のエピソード')
    .selectOption({ label: '2. 続きの話' });
  const input = page.getByTestId('block').nth(8).getByLabel('地の文本文');
  await input.fill('ここから続きを書く');
  await input.evaluate((element) =>
    element.scrollIntoView({ block: 'center' }),
  );
  const before = await input.boundingBox();
  const blockId = await page
    .getByTestId('block')
    .nth(8)
    .getAttribute('data-block-id');
  const id = page.url().split('/').at(-1)!;
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.blockId,
        `kakkeko-position:${id}`,
      ),
    )
    .toBe(blockId);
  await expect(page.locator('.save-status')).toContainText('保存済み');
  await page.reload();
  await expect(page.getByLabel('編集中のエピソード')).toHaveValue(/.+/);
  await expect(input).toHaveValue('ここから続きを書く');
  await expect
    .poll(async () => (await input.boundingBox())?.y)
    .toBeGreaterThan(100);
  await expect
    .poll(async () => Math.abs((await input.boundingBox())!.y - before!.y))
    .toBeLessThan(10);
  await expect(input).not.toBeFocused();
  await page
    .getByRole('navigation', { name: '編集画面切替' })
    .getByRole('button', { name: 'プレビュー', exact: true })
    .click();
  await expect(page.getByTestId('episode-renderer')).toContainText(
    'ここから続きを書く',
  );
  await page.reload();
  await expect(input).toHaveValue('ここから続きを書く');
  await expect
    .poll(async () => Math.abs((await input.boundingBox())!.y - before!.y))
    .toBeLessThan(10);
  await page.getByRole('button', { name: '作品一覧に戻る' }).click();
  await page.getByRole('link', { name: '続きを編集 →', exact: true }).click();
  await expect(input).toHaveValue('ここから続きを書く');
  await expect
    .poll(async () => Math.abs((await input.boundingBox())!.y - before!.y))
    .toBeLessThan(10);
  await expect(input).not.toBeFocused();
  await page.screenshot({ path: test.info().outputPath('mobile-resumed.png') });
});
