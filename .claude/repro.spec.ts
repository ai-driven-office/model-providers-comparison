import { test } from '@playwright/test';

test('capture client errors', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[console:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  await page.goto('http://127.0.0.1:4321/model-providers-comparison', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('==== LOGS START ====');
  for (const l of logs) {
    console.log(l);
  }
  console.log('==== LOGS END ====');
});
