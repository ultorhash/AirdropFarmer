import { BrowserContext } from "playwright";
import { confirmTx, connectWallet } from "./metamask";

export const gaspump = async (context: BrowserContext, min: number, max: number): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://gaspump.network");
  await page.waitForLoadState('domcontentloaded');

  page.locator('text="Connect a wallet"').click();
  page.locator('text="MetaMask"').click();

  await connectWallet(context);

  await page.mouse.click(100, 200);
  await page.locator('[data-testid="swap-select-token-btn"]').first().click();
  await page.locator('[data-testid="token-picker-item"]').filter({
    has: page.locator('div:nth-child(2)', { hasText: /^Ether$/ })
  }).first().click();

  await page.waitForTimeout(2000);

  await page.locator('[data-testid="swap-select-token-btn"]').nth(1).click();
  await page.locator('[data-testid="token-picker-item"]').filter({
    has: page.locator('div:nth-child(2)', { hasText: /^WETH$/ })
  }).first().click();

  await page.waitForTimeout(500);

  const amount = (Math.random() * (max - min) + min).toFixed(6);
  await page.locator('.base-Input-input').first().fill(amount);

  const swapBtn = page.locator('[data-testid="swap-review-btn"]');
  await page.waitForFunction((el) => {
    return !el.classList.contains('base--disabled');
  }, await swapBtn.elementHandle());

  await swapBtn.click();
  await page.locator('button.base-Button-root', { hasText: 'Confirm swap' }).click();

  await confirmTx(context);

  await page.locator('text="1 pending..."').click();
  await page.locator('[data-testid="DisconnectIcon"]').click();

  await page.waitForTimeout(1000);
  await page.close();
}

// DEPRECATED
export const clober = async (context: BrowserContext, min: number, max: number) => {
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

  const amount = (Math.random() * (max - min) + min).toFixed(6);
  page.locator('input.flex-1').first().fill(amount);
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

  await page.waitForTimeout(1000);
  await page.close();
}

export const inarifi = async (context: BrowserContext, min: number, max: number) => {
  const page = await context.newPage();
  page.goto("https://www.inarifi.com/?marketName=proto_inari_rise");
  await page.waitForLoadState('domcontentloaded');

  await page.locator('a[href*="/markets"]').click();
  await page.locator('a[href*="/reserve-overview/?underlyingAsset=0x4200000000000000000000000000000000000006&marketName=proto_inari_rise"]').click();
  await page.locator('button:has-text("Accept and Connect")').click();
  await page.locator('button:has-text("Browser wallet")').first().click({ force: true });

  const [connectPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await connectPopup.waitForLoadState('domcontentloaded');
  const connect = await connectPopup.waitForSelector('[data-testid="confirm-btn"]');
  connect.click();

  await connectPopup.waitForEvent('close');

  await page.locator('[data-cy="supplyButton"]').click();
  const amount = (Math.random() * (max - min) + min).toFixed(6);
  await page.locator('input[aria-label="amount input"]').fill(amount);

  const approvalButton = await page.waitForSelector('[data-cy="approvalButton"]', {
    timeout: 4000,
    state: 'visible'
  }).catch(() => null);

  if (approvalButton) {
    await page.locator('[data-cy="approvalButton"]').click();
    const [spendingCapPopup] = await Promise.all([
      context.waitForEvent('page')
    ]);

    await spendingCapPopup.waitForLoadState('domcontentloaded');
    const spendingCap = await spendingCapPopup.waitForSelector('[data-testid="confirm-footer-button"]');
    spendingCap.click();
    await spendingCapPopup.waitForEvent('close');

    await page.mouse.click(100, 200);
    await page.waitForTimeout(5000);
  }

  await page.locator('[data-cy="supplyButton"]').click();
  await page.locator('input[aria-label="amount input"]').fill(amount);

  await page.locator('[data-cy="actionButton"]').click();
  const [depositPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await depositPopup.waitForLoadState('domcontentloaded');
  const deposit = await depositPopup.waitForSelector('[data-testid="confirm-footer-button"]');
  deposit.click();

  await page.waitForTimeout(1000);
  await page.close();
}
