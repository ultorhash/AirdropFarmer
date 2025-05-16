import { BrowserContext } from "playwright";
import { rabbyConfirmTx } from "../utils/wallets";
import { Logger } from "../utils/logger";

export const pharos = async (
  context: BrowserContext,
  account: string
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.pharosnetwork.xyz/");
  await page.waitForLoadState('domcontentloaded');

  await page.waitForTimeout(1_000_000);
}

export const zenith = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.zenithswap.xyz/swap");
  await page.waitForLoadState('domcontentloaded');

  try {
    // Select token to swap
    const tokens = ["USDC", "USDT", "wPHRS"];
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)]
    await page.locator('button.open-currency-select-button').filter({ hasText: /^Select token$/ }).click();
    await page.locator('div').filter({ hasText: new RegExp(`^${randomToken}$`) }).first().click();

    // Enter the amount
    const amount = (Math.random() * (max - min) + min).toFixed(5);
    await page.locator('input#swap-currency-input[placeholder="0"]').fill(amount);

    // Detect if swap or wrap
    const wrapBtn = await page.waitForSelector('[data-testid="wrap-button"]', { timeout: 3000 }).catch(() => null);
    if (wrapBtn) {
      await wrapBtn.click();
    } else {
      await page.waitForSelector('#swap-button').then(() => page.click('#swap-button'));
      await page.locator('[data-testid="confirm-swap-button"]').click();
    }

    await rabbyConfirmTx(context);
    Logger.ok(account, "zenith swap");
    
  } catch (err: unknown) {
    Logger.error(account, "zenith swap");
  } finally {
    page.close();
  }
}
