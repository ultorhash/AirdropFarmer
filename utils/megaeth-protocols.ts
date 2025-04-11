import { BrowserContext } from "playwright";

export const gte = async (context: BrowserContext) => {
  const page = await context.newPage();
  page.goto("https://testnet.gte.xyz/");
  await page.waitForLoadState('domcontentloaded');

  await page.locator('div[role="dialog"] button').first().click();
  await page.locator('button:has-text("Connect Wallet")').click();
  await page.locator('.login-method-button').last().click();
  await page.locator('.login-method-button').nth(1).click();

  const [connectPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await connectPopup.waitForLoadState('domcontentloaded');
  const connect = await connectPopup.waitForSelector('[data-testid="confirm-btn"]');
  connect.click();
  await connectPopup.waitForLoadState('domcontentloaded');
  const sign = await connectPopup.waitForSelector('[data-testid="confirm-footer-button"]');
  sign.click();
  await connectPopup.waitForEvent('close');

  await page.waitForTimeout(4000);

  const targetDiv = await page.locator('div.size-8.rounded-full.bg-card');
  await targetDiv.click();
  const ethDiv = await page.locator('div:has-text("ETH")');
  await ethDiv.click();

  //const toButton = page.locator('button[type="button"][aria-haspopup="dialog"][aria-expanded="false"]').nth(1);
}

export const bebop = async (context: BrowserContext) => {
  const page = await context.newPage();
  page.goto("https://bebop.xyz/trade?network=megaeth");
  await page.waitForLoadState('domcontentloaded');

  page.locator('[data-testid="action-btn"]').click();
  page.locator('[data-testid="rk-wallet-option-io.metamask"]').click();

  const [connectPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await connectPopup.waitForLoadState('domcontentloaded');
  const connect = await connectPopup.waitForSelector('[data-testid="confirm-btn"]');
  connect.click();
  await connectPopup.waitForEvent('close');

  page.locator('[data-testid="token-selector-trigger"]').first().click();
  page.locator('[data-testid="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE-token-selector-row-taker"]').click();

  page.locator('[data-testid="token-selector-trigger"]').nth(1).click();
  page.locator('[data-testid="0x4eB2Bd7beE16F38B1F4a0A5796Fffd028b6040e9-token-selector-row-maker"]').click();

  page.locator('[data-testid="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE-amount-input"]').fill(0.00002.toString());
  page.locator('[data-testid="action-btn"]').click();

  const [txPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await txPopup.waitForLoadState('domcontentloaded');
  const approve = await txPopup.waitForSelector('[data-testid="confirm-footer-button"]');
  approve.click();

  page.locator('[data-testid="wallet-address-label"]').click();
  await page.click('span:has-text("Disconnect wallet")');

  await page.context().clearCookies();
  await page.close();
}
