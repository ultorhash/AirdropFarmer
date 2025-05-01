import { BrowserContext, Locator } from "playwright";
import { clearActivity, confirmTx, connectWallet } from "../helpers";
import { Logger } from "../utils/logger";

export const gaspump = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  try {
    const page = await context.newPage();
    page.goto("https://gaspump.network");
    await page.waitForLoadState('networkidle');

    const amount = (Math.random() * (max - min) + min).toFixed(6);
    await page.locator('.base-Input-input').first().fill(amount);

    await page.locator('[data-testid="swap-review-btn"]').filter({ hasText: /^Review Swap$/ }).click();
    await page.locator('button.base-Button-root', { hasText: 'Confirm swap' }).click();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Confirm tx timeout')), 5000)
    );

    await Promise.race([confirmTx(context), timeoutPromise]);
    await page.close();
  
    console.log("\x1b[32m", account, "gaspump success", "\x1b[0m");
  } catch (error: unknown) {
    console.log("\x1b[31m", account, "gaspump error", "\x1b[0m");
  }
}

export const clober = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  wrap: boolean,
  unwrap: boolean
): Promise<void> => {
  try {
    const page = await context.newPage();
    await page.goto("https://rise.clober.io/trade?chain=11155931");
    await page.waitForLoadState('networkidle');

    let swapBtn: Locator;
    const amount = (Math.random() * (max - min) + min).toFixed(6);

    if (unwrap) {
      await page.locator('button').filter({ hasText: /^MAX$/ }).first().click();
      swapBtn = page.locator('button:has-text("Unwrap")').first();
      await swapBtn.waitFor({ state: 'visible' });
    } else if (wrap) {
      await page.locator('input.flex-1').first().fill(amount);
      swapBtn = page.locator('button:has-text("Wrap")').first();
      await swapBtn.waitFor({ state: 'visible' });
    } else {
      await page.locator('input.flex-1').first().fill(amount);
      swapBtn = page.locator('button:has-text("Swap")').nth(2);
      await swapBtn.waitFor({ state: 'visible' });
    }

    swapBtn.click();

    await confirmTx(context);
    await page.waitForTimeout(5000);
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

export const b3x = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  try {
    const page = await context.newPage();
    page.goto("https://testnet.b3x.ai/#/trade");
    await page.waitForLoadState('networkidle');

    let tradeType: string;

    // Select tokens
    await page.locator('span.Token-symbol-text').first().click();
    await page.click('img[alt="WSTETH"]');
    await page.locator('span.Token-symbol-text').nth(1).click();
    await page.click('img[alt="XRP/USD"]');
    //

    // Switch from previous trade type E.g. Long -> Short
    const isLongSelected = await page.locator('div.Tab-option').evaluateAll(el => {
      return el.some((el: HTMLElement) => el.getAttribute('class')?.includes('active') && el.innerText.includes('Long'));
    });

    if (isLongSelected) {
      await page.locator('span.boldFont').filter({ hasText: 'Short' }).click();
      tradeType = "Short";

    } else {
      await page.locator('span.boldFont').filter({ hasText: 'Long' }).click();
      tradeType = "Long";
    }
    //

    // Enter the amount and long
    const amount = (Math.random() * (max - min) + min).toFixed(6);
    await page.locator('input.Exchange-swap-input').first().fill(amount);
    await page.locator('button').filter({ hasText: new RegExp(`^${tradeType} XRP$`) }).click();
    await page.locator('button').filter({ hasText: new RegExp(`^${tradeType}$`) }).click();
    //

    await confirmTx(context);
    await page.waitForTimeout(2000);
    await page.close();

    Logger.ok(account, `b3x [position: ${tradeType}]`);
  } catch (error: unknown) {
    Logger.error(account, "b3x");
  }
}
