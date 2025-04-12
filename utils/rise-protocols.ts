import { BrowserContext } from "playwright";

export const gasPump = async (context: BrowserContext) => {
  const page = await context.newPage();
  page.goto("https://gaspump.network");
  await page.waitForLoadState('domcontentloaded');

  page.locator('text="Connect a wallet"').click();
  page.locator('text="MetaMask"').click();

  const [connectPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await connectPopup.waitForLoadState('domcontentloaded');
  const connect = await connectPopup.waitForSelector('[data-testid="confirm-btn"]');
  connect.click();

  await connectPopup.waitForEvent('close');

  await page.mouse.click(100, 200);
  await page.locator('[data-testid="swap-select-token-btn"]').first().click();
  await page.locator('div.token-list').waitFor({ state: 'visible', timeout: 2000 }); 
  await page.locator('div:has-text("Ether")').click();
  await page.locator('.base-Input-input').fill(0.00003.toString());
}

export const clober = async (context: BrowserContext) => {
  const page = await context.newPage();
  page.goto("https://rise.clober.io/trade?chain=11155931");
  await page.waitForLoadState('domcontentloaded');

  page.locator('button:has-text("Connect")').first().click();
  page.locator('text="MetaMask"').click();

  const [connectPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await connectPopup.waitForLoadState('domcontentloaded');
  const connect = await connectPopup.waitForSelector('[data-testid="confirm-btn"]');
  connect.click();

  await connectPopup.waitForEvent('close');

  page.locator('input.flex-1').first().fill(0.00005.toString());
  const swapBtn = page.locator('button:has-text("Swap")').nth(2);
  await swapBtn.waitFor({ state: 'visible' });
  swapBtn.click();

  const [txPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await txPopup.waitForLoadState('domcontentloaded');
  const approve = await txPopup.waitForSelector('[data-testid="confirm-footer-button"]');
  approve.click();

  page.locator('button.group').locator('text=0x').click();
  await page.locator('button.p-1.sm\\:p-2.bg-gray-700.rounded-lg.flex.flex-col.items-center.justify-center.w-6.sm\\:w-8.h-6.sm\\:h-8 svg path[fill="#EF4444"]').click();

  await page.context().clearCookies();
  await page.close();
}
