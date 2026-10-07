import { expect, test } from './fixtures';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
test.use({ viewport: { width: 1440, height: 1000 } });
test('new project → character → writing → reorder → reload → HTML and JSON roundtrip', async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await page.getByRole('button', { name: '＋ 新規作品', exact: true }).click();
  await page.getByLabel('作品タイトル', { exact: true }).fill('旅のはじまり');
  await page.getByRole('button', { name: '作品を作成', exact: true }).click();
  await page
    .getByRole('button', { name: '＋ キャラクターを追加', exact: true })
    .click();
  await page.getByLabel('キャラクター名', { exact: true }).fill('アオイ');
  await page
    .getByRole('button', { name: 'キャラクターを登録', exact: true })
    .click();
  await page.getByRole('button', { name: '＋ セリフ', exact: true }).click();
  let blocks = page.getByTestId('block');
  await expect(blocks.last().getByLabel('セリフ本文')).toBeFocused();
  await blocks.last().getByLabel('セリフ本文').fill('ここから冒険がはじまる。');
  await blocks.last().getByLabel('セリフ本文').press('Control+Enter');
  await expect(blocks).toHaveCount(2);
  await expect(blocks.last().getByLabel('セリフ本文')).toBeFocused();
  await blocks.last().getByLabel('セリフ本文').fill('準備はいい？');
  await page.getByRole('button', { name: '＋ 地の文', exact: true }).click();
  await blocks.last().getByLabel('地の文本文').fill('朝の風が吹いた。');
  await blocks
    .last()
    .getByRole('button', { name: 'ブロックを上へ', exact: true })
    .click();
  await expect(blocks.nth(1).getByLabel('地の文本文')).toHaveValue(
    '朝の風が吹いた。',
  );
  await page
    .getByRole('button', { name: '元に戻す', exact: true })
    .click({ delay: 80 });
  await expect(blocks.last().getByLabel('地の文本文')).toHaveValue(
    '朝の風が吹いた。',
  );
  await page.getByRole('button', { name: 'やり直す', exact: true }).click();
  await expect(page.locator('.save-status [role=status]')).toHaveText(
    '保存済み',
  );
  await page.reload();
  blocks = page.getByTestId('block');
  await expect(blocks).toHaveCount(3);
  await expect(blocks.first().getByLabel('セリフ本文')).toHaveValue(
    'ここから冒険がはじまる。',
  );
  await page.getByRole('button', { name: '書き出し', exact: true }).click();
  let downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ダウンロード', exact: true }).click();
  const htmlDownload = await downloadPromise;
  const htmlPath = test.info().outputPath('story.html');
  await htmlDownload.saveAs(htmlPath);
  const html = await readFile(htmlPath, 'utf8');
  expect(html).toContain('ここから冒険がはじまる。');
  expect(html).not.toContain('<script');
  const reader = await browser.newContext({ javaScriptEnabled: false });
  const reading = await reader.newPage();
  await reading.goto(pathToFileURL(htmlPath).href);
  await expect(
    reading.getByText('ここから冒険がはじまる。', { exact: true }),
  ).toBeVisible();
  await reader.close();
  await page.getByLabel('書き出し形式', { exact: true }).selectOption('json');
  downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ダウンロード', exact: true }).click();
  const jsonDownload = await downloadPromise;
  const jsonPath = test.info().outputPath('story.json');
  await jsonDownload.saveAs(jsonPath);
  await page
    .getByRole('button', { name: '閉じる', exact: true })
    .last()
    .click();
  await page.getByRole('button', { name: '作品一覧に戻る' }).click();
  await page.getByRole('link', { name: 'インポート', exact: true }).click();
  await page
    .getByLabel('JSONファイル', { exact: true })
    .setInputFiles(jsonPath);
  await page.getByRole('button', { name: '1作品をインポート' }).click();
  await expect(page.getByTestId('block')).toHaveCount(3);
  await expect(
    page.getByTestId('block').first().getByLabel('話し手', { exact: true }),
  ).not.toHaveValue('');
  await expect(
    page.getByTestId('episode-renderer').getByText('アオイ').first(),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('editor-desktop.png'),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test('all block types, hidden/private content, character edits and keyboard reorder', async ({
  page,
}) => {
  await page.goto('/#/import');
  await page
    .getByLabel('JSONファイル')
    .setInputFiles(path.join(process.cwd(), 'sample-project.json'));
  await page.getByRole('button', { name: '1作品をインポート' }).click();
  const blocks = page.getByTestId('block');
  await expect(blocks).toHaveCount(3);
  await blocks
    .first()
    .getByRole('button', { name: 'ブロック 1 を並べ替え' })
    .focus();
  await page.keyboard.press('Space', { delay: 100 });
  await expect(
    blocks.first().getByRole('button', { name: 'ブロック 1 を並べ替え' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[id^="DndLiveRegion"]')).toContainText('2番目');
  await page.keyboard.press('Space');
  await expect(blocks.first().getByLabel('地の文本文')).toBeVisible();
  await page
    .getByRole('button', { name: '元に戻す', exact: true })
    .click({ delay: 80 });
  await page.getByRole('button', { name: '＋ 見出し', exact: true }).click();
  await blocks.last().getByLabel('見出し本文').fill('第二幕');
  await page.getByRole('button', { name: '＋ 区切り', exact: true }).click();
  await blocks.last().getByLabel('区切りの種類').selectOption('scene');
  await page.getByRole('button', { name: '＋ メモ', exact: true }).click();
  await blocks.last().getByLabel('メモ本文').fill('公開しないメモ');
  await expect(page.getByTestId('episode-renderer')).not.toContainText(
    '公開しないメモ',
  );
  await page.getByRole('button', { name: '＋ 画像', exact: true }).click();
  await blocks.last().getByLabel('代替テキスト').fill('森の入口');
  await blocks
    .last()
    .getByLabel('本文画像', { exact: true })
    .setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==',
        'base64',
      ),
    });
  await expect(
    page.getByTestId('episode-renderer').getByRole('img', { name: '森の入口' }),
  ).toBeVisible();
  await blocks
    .first()
    .getByRole('button', { name: 'ブロックを非表示', exact: true })
    .click();
  await expect(page.getByTestId('episode-renderer')).not.toContainText(
    'これは大変なことになったお',
  );
  await blocks
    .first()
    .getByRole('button', { name: 'ブロックを表示', exact: true })
    .click();
  await page.getByLabel('ブーンの操作', { exact: true }).click();
  await page
    .locator('.character-item')
    .filter({ has: page.getByRole('button', { name: /ブーン/ }) })
    .getByRole('button', { name: '削除', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('アーカイブ');
  await page
    .locator('.character-item')
    .first()
    .getByRole('button', { name: '編集', exact: true })
    .click();
  await page.getByLabel('キャラクター名', { exact: true }).fill('ブーン改');
  await page.getByRole('button', { name: '変更を保存', exact: true }).click();
  await expect(page.getByTestId('episode-renderer')).toContainText('ブーン改');
  const textarea = blocks.first().getByLabel('セリフ本文');
  await textarea.focus();
  await textarea.dispatchEvent('compositionstart');
  await page.keyboard.press('Control+Enter');
  await expect(blocks).toHaveCount(7);
  await textarea.dispatchEvent('compositionend');
  await page
    .getByRole('button', { name: 'エピソード管理', exact: true })
    .click();
  await page
    .getByRole('button', { name: '＋ 新規エピソード', exact: true })
    .click();
  await page.getByLabel('エピソードタイトル', { exact: true }).fill('次の物語');
  await page.getByLabel('slug', { exact: true }).fill('second');
  await page
    .getByRole('button', { name: 'エピソード設定を保存', exact: true })
    .click();
  await page.getByRole('button', { name: '閉じる', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '次の物語' }).first(),
  ).toBeVisible();
  await page
    .locator('.preview-pane')
    .getByRole('button', { name: '← 前の話' })
    .click();
  await expect(blocks).toHaveCount(7);
});
test('mouse drag changes order and can be undone', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
  const blocks = page.getByTestId('block');
  await expect(blocks).toHaveCount(3);
  const handle = await blocks
    .first()
    .getByRole('button', { name: 'ブロック 1 を並べ替え' })
    .boundingBox();
  const target = await blocks.nth(1).boundingBox();
  if (!handle || !target) throw new Error('Missing drag target');
  await page.mouse.move(
    handle.x + handle.width / 2,
    handle.y + handle.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    handle.x + handle.width / 2,
    target.y + target.height / 2,
    { steps: 15 },
  );
  await page.mouse.up();
  await expect(blocks.first().getByLabel('地の文本文')).toBeVisible();
  await page
    .getByRole('button', { name: '元に戻す', exact: true })
    .click({ delay: 80 });
  await expect(blocks.first().getByLabel('セリフ本文')).toBeVisible();
});
test('corrupt and future JSON are rejected with an actionable report', async ({
  page,
}) => {
  await page.goto('/#/import');
  await page.getByLabel('JSONファイル').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{'),
  });
  await expect(page.getByRole('alert')).toContainText('JSONが破損');
  await page.getByLabel('JSONファイル').setInputFiles({
    name: 'future.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"schemaVersion":"9.0.0"}'),
  });
  await expect(page.getByRole('alert')).toContainText('未対応のschemaVersion');
});
