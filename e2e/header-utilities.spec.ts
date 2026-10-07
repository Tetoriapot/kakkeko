import { expect, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

test('header appearance persists and stays synchronized with settings', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const mode = page.getByRole('combobox', { name: '表示モード', exact: true });
  await expect(mode).toHaveValue('system');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await mode.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute(
    'data-appearance',
    'light',
  );
  await page.reload();
  await expect(mode).toHaveValue('light');
  await page.getByRole('link', { name: '設定', exact: true }).click();
  await expect(page.getByLabel('外観')).toHaveValue('light');
  await page.getByLabel('外観').selectOption('dark');
  await expect(mode).toHaveValue('dark');
  await mode.selectOption('system');
  await expect(page.getByLabel('外観')).toHaveValue('system');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).not.toHaveCSS('color-scheme', 'dark');
});

test('updates and Help open in place, restore focus, and preserve the editor draft', async ({
  page,
}) => {
  await page.goto('/');
  const updates = page.getByRole('button', { name: '更新情報', exact: true });
  await updates.click();
  const history = page.getByRole('dialog', { name: '更新情報', exact: true });
  await expect(history).toContainText('2026年10月5日');
  await expect(history).toContainText('2026年10月2日');
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(updates).toBeFocused();
  await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
  const input = page.getByTestId('block').first().getByLabel('セリフ本文');
  await input.fill('Helpを開いても編集中の原稿を保持');
  const editorUrl = page.url();
  const help = page.getByRole('button', { name: 'Help', exact: true });
  await help.click();
  const dialog = page.getByRole('dialog', { name: 'Help・使い方' });
  await expect(dialog).toContainText('Ctrl / Cmd + Enter');
  await expect(dialog).toContainText('このブラウザーに保存されます');
  await page.keyboard.press('Control+Enter');
  await expect(page.getByTestId('block')).toHaveCount(3);
  await dialog.getByRole('button', { name: '閉じる', exact: true }).click();
  await expect(help).toBeFocused();
  expect(page.url()).toBe(editorUrl);
  await expect(input).toHaveValue('Helpを開いても編集中の原稿を保持');
  await page
    .getByRole('combobox', { name: '表示モード', exact: true })
    .selectOption('dark');
  await help.click();
  const darkAudit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(darkAudit.violations).toEqual([]);
  await page.screenshot({ path: test.info().outputPath('help-dark.png') });
  await page.keyboard.press('Escape');
  await updates.click();
  await expect(history).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(updates).toBeFocused();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('.save-status')).toContainText('保存済み');
  await page.reload();
  await expect(input).toHaveValue('Helpを開いても編集中の原稿を保持');
});

test('utilities stay at the upper right on narrow screens and tablet preview clears the header', async ({
  page,
}) => {
  for (const width of [320, 390, 800, 1199, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const utilities = page.getByRole('group', { name: '共通メニュー' });
    const checkPosition = async () => {
      await expect(utilities).toBeVisible();
      const box = await utilities.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThan(width / 3);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(box!.y).toBeLessThan(40);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      if (width < 800) {
        const heights = await utilities
          .locator('button, select')
          .evaluateAll((elements) =>
            elements.map((element) => element.getBoundingClientRect().height),
          );
        expect(heights.every((height) => height >= 44)).toBe(true);
      }
    };
    await checkPosition();
    await page.screenshot({
      path: test.info().outputPath(`home-${width}.png`),
    });
    await page.getByRole('button', { name: 'サンプル作品を開く' }).click();
    await expect(page.locator('.editor-header')).toBeVisible();
    await checkPosition();
    if (width >= 800 && width < 1200) {
      await page.locator('.header-preview-button').click();
      const header = await page.locator('.editor-header').boundingBox();
      const preview = await page
        .getByRole('complementary', { name: 'ライブプレビュー' })
        .boundingBox();
      expect(preview!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
      await page.getByRole('button', { name: 'Help', exact: true }).click();
      await expect(
        page.getByRole('dialog', { name: 'Help・使い方' }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
    }
    await page.screenshot({
      path: test.info().outputPath(`header-${width}.png`),
    });
  }
});
