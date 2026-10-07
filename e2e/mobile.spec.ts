import { expect, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
test('mobile tabs, quick speaker, bottom bar and preview have no horizontal overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'サンプル作品を開く' }).tap();
  await expect(
    page.getByRole('navigation', { name: '編集画面切替' }),
  ).toBeVisible();
  await page
    .getByLabel('次の話し手', { exact: true })
    .selectOption({ label: '2. GM' });
  await page.getByRole('button', { name: '＋ 発言', exact: true }).tap();
  const input = page.getByTestId('block').last().getByLabel('セリフ本文');
  await input.fill('スマホで追加した発言');
  await expect(input).toBeFocused();
  const bar = await page
    .getByRole('toolbar', { name: 'ブロック追加' })
    .boundingBox();
  expect(bar!.y + bar!.height).toBeLessThanOrEqual(845);
  const targets = await page
    .getByRole('toolbar', { name: 'ブロック追加' })
    .getByRole('button')
    .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().height));
  expect(targets.every((h) => h >= 44)).toBe(true);
  await page
    .getByRole('navigation', { name: '編集画面切替' })
    .getByRole('button', { name: 'プレビュー', exact: true })
    .tap();
  await expect(page.getByTestId('episode-renderer')).toContainText(
    'スマホで追加した発言',
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: test.info().outputPath('preview-mobile.png'),
    fullPage: true,
  });
  await page
    .getByRole('navigation', { name: '編集画面切替' })
    .getByRole('button', { name: '設定', exact: true })
    .tap();
  await expect(
    page.getByRole('button', { name: '＋ キャラクターを追加' }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: '編集画面切替' })
    .getByRole('button', { name: '編集', exact: true })
    .tap();
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({
    path: test.info().outputPath('editor-mobile.png'),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test('touch handle can move a block with long press and Undo restores it', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 1400 });
  await page.goto('/');
  await page.getByRole('button', { name: 'サンプル作品を開く' }).tap();
  const blocks = page.getByTestId('block');
  await expect(blocks).toHaveCount(3);
  const handle = await blocks
    .first()
    .getByRole('button', { name: 'ブロック 1 を並べ替え' })
    .boundingBox();
  const target = await blocks.nth(1).boundingBox();
  if (!handle || !target) throw new Error('Touch target is missing');
  const session = await context.newCDPSession(page);
  const x = handle.x + handle.width / 2;
  const y = handle.y + handle.height / 2;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  await page.waitForTimeout(280);
  for (let i = 1; i <= 12; i++)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x, y: y + ((target.y + target.height / 2 - y) * i) / 12 },
      ],
    });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect(blocks.first().getByLabel('地の文本文')).toBeVisible();
  await page.getByRole('button', { name: '元に戻す', exact: true }).tap();
  await expect(blocks.first().getByLabel('セリフ本文')).toBeVisible();
});
