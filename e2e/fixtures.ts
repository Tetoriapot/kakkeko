import { test as base, expect } from '@playwright/test';
export const test = base.extend<{ verifyConsole: void }>({
  verifyConsole: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      await use();
      expect(errors, 'ブラウザーのコンソールエラー').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
