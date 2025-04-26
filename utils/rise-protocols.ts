import { BrowserContext } from "playwright";
import { confirmTx, connectWallet } from "./metamask-manual";
import { clearActivity } from "./helpers";
import { Logger } from "./logger";

export const gaspump = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  try {
    const page = await context.newPage();
    page.goto("https://gaspump.network");
    await page.waitForLoadState('domcontentloaded');

    await page.locator('text="Connect a wallet"').click();
    await page.locator('text="MetaMask"').click();

    await connectWallet(context);

    await page.mouse.click(100, 200);
    //await page.waitForSelector('[data-testid="LoadingIcon"]', { state: 'detached' });
    await page.locator('[data-testid="swap-select-token-btn"]').first().click();
    await page.locator('[data-testid="token-picker-item"]').filter({
      has: page.locator('div:nth-child(2)', { hasText: /^Ether$/ })
    }).first().click();

    await page.waitForTimeout(1500);

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
    await page.locator('text=pending...').click();
    await page.locator('[data-testid="DisconnectIcon"]').click();

    await context.clearCookies();
    await page.close();
  
    console.log("\x1b[32m", account, "gaspump success", "\x1b[0m");
  } catch (error: unknown) {
    console.log("\x1b[31m", account, "gaspump error", "\x1b[0m");
  }
}

export const clober = async (context: BrowserContext, account: string, min: number, max: number) => {
  try {
    const page = await context.newPage();
    await page.goto("https://rise.clober.io/trade?chain=11155931");
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Connect")').first().click();
    await page.locator('text="MetaMask"').click();

    await connectWallet(context);

    const amount = (Math.random() * (max - min) + min).toFixed(6);
    await page.locator('input.flex-1').first().fill(amount);

    const isSelectToken = await page
      .locator('button.h-8.flex.items-center.rounded-full.bg-blue-500.text-white.font-semibold.pl-3.pr-2.py-1.gap-2.text-sm')
      .count()

    if (isSelectToken > 0) {
      await page.locator('button:has-text("Select token")').first().click();
      await page.locator('button:has(div.text-white:has-text("cUSDC"))').first().click();
    }

    const swapBtn = page.locator('button:has-text("Swap")').nth(2);
    await swapBtn.waitFor({ state: 'visible' });
    swapBtn.click();

    await confirmTx(context);
    await clearActivity(context, page);
    await page.close();

    Logger.ok(account, "clober");
  } catch (error: unknown) {
    Logger.error(account, "clober");
  }
}

export const inarifi = async (context: BrowserContext, account: string, min: number, max: number) => {
  try {
    const page = await context.newPage();
    page.goto("https://www.inarifi.com/?marketName=proto_inari_rise");
    await page.waitForLoadState('networkidle');

    await page.locator('a[href*="/markets"]').click();
    await page.locator('a[href*="/reserve-overview/?underlyingAsset=0x4200000000000000000000000000000000000006&marketName=proto_inari_rise"]').click();
    await page.locator('button:has-text("Accept and Connect")').click();
    await page.locator('button:has-text("Browser wallet")').first().click({ force: true });

    await connectWallet(context);

    await page.locator('[data-cy="supplyButton"]').click();
    const amount = (Math.random() * (max - min) + min).toFixed(6);
    await page.locator('input[aria-label="amount input"]').fill(amount);

    const approveBtn = await page.waitForSelector('[data-cy="approvalButton"]', {
      timeout: 4000,
      state: 'visible'
    }).catch(() => null);

    const supplyBtn = page.locator('[data-cy="actionButton"]');

    if (approveBtn) {
      await page.locator('[data-cy="approvalButton"]').click();
      await confirmTx(context);
      await page.mouse.click(100, 200);
      await page.waitForTimeout(6000);

      await page.locator('[data-cy="supplyButton"]').click();
      await page.locator('input[aria-label="amount input"]').fill("0.00002");

      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-cy="actionButton"]');
        return btn && !btn.hasAttribute('disabled');
      });
    }

    await supplyBtn.click();
    await confirmTx(context);
    await clearActivity(context, page);
    await page.close();

    Logger.ok(account, "inafiri");
  } catch (error: unknown) {
    Logger.error(account, "inafiri");
  }
}
