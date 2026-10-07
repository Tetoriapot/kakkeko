import { expect, test } from './fixtures';
import sample from '../sample-project.json' with { type: 'json' };
test.use({ viewport: { width: 1440, height: 1000 } });
test('1000 blocks remain editable, saveable and exportable', async ({
  page,
}) => {
  test.setTimeout(60000);
  const doc = structuredClone(sample);
  doc.project.title = '1000ブロック性能確認';
  doc.episodes[0].blocks = Array.from({ length: 1000 }, (_, i) => ({
    ...sample.episodes[0].blocks[0],
    id: `performance-${i}`,
    text: `発言 ${i + 1}`,
  }));
  await page.goto('/#/import');
  await page.getByLabel('JSONファイル').setInputFiles({
    name: 'large.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(doc)),
  });
  const start = Date.now();
  await page.getByRole('button', { name: '1作品をインポート' }).click();
  await expect(page.getByTestId('block')).toHaveCount(1000, { timeout: 20000 });
  const loadMs = Date.now() - start;
  const input = page.getByTestId('block').first().getByLabel('セリフ本文');
  const editStart = Date.now();
  await input.fill('1000ブロックでも編集できます');
  await expect(input).toHaveValue('1000ブロックでも編集できます');
  const editMs = Date.now() - editStart;
  expect(editMs).toBeLessThan(1500);
  await expect(page.locator('.save-status [role=status]')).toHaveText(
    '保存済み',
    { timeout: 10000 },
  );
  await expect(page.getByTestId('episode-renderer')).toContainText(
    '1000ブロックでも編集できます',
  );
  await page.getByRole('button', { name: '書き出し', exact: true }).click();
  await page.getByLabel('書き出し形式', { exact: true }).selectOption('json');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ダウンロード', exact: true }).click();
  expect((await download).suggestedFilename()).toContain('.json');
  await test.info().attach('performance.json', {
    body: JSON.stringify({ blocks: 1000, loadMs, editMs }),
    contentType: 'application/json',
  });
  console.log(JSON.stringify({ blocks: 1000, loadMs, editMs }));
});
