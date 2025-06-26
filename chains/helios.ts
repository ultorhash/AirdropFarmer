import { BrowserContext } from "playwright";
import { rabbyConfirmTx, rabbyConnect } from "../utils/wallets";
import { Logger } from "../utils/logger";

export const heliosStake = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://portal.helioschain.network/validators");
  await page.waitForLoadState('domcontentloaded');

  try {
    // Login and authenticate
    await page.locator('button', { hasText: /^Connect Wallet$/ }).click();
    await page.click('text=Rabby Wallet');
    await rabbyConnect(context, true);
    await page.locator('[data-testid="w3m-connecting-siwe-sign"]').click();
    await rabbyConfirmTx(context);

    await page.reload();

    // Stake Helios
    await page.locator('button', { hasText: /^Stake Now$/ }).first().click();
    await page.locator('select').selectOption({ label: 'Helios' });
    await page.locator('input[type="text"]').fill((Math.random() * (max - min) + min).toFixed(5));
    await page.locator('button', { hasText: /^Confirm Stake$/ }).first().click();
    await rabbyConfirmTx(context);
    await page.locator('text=Delegation successful').waitFor({ state: 'visible' });
    Logger.ok(account, "stake");

  } catch (err: unknown) {
    Logger.error(account, "stake");
  } finally {
    await page.mouse.click(10, 10);
    await page.locator('span', { hasText: "…" }).click();
    await page.locator('button', { hasText: /^Logout$/ }).click();
    await page.close();
  }
}

export const heliosBridge = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://portal.helioschain.network/bridge");
  await page.waitForLoadState('networkidle');

  try {
    //Login and authenticate
    await page.locator('button', { hasText: /^Connect Wallet$/ }).click();
    await page.click('text=Rabby Wallet');
    await rabbyConnect(context, true);
    await page.locator('[data-testid="w3m-connecting-siwe-sign"]').click();
    await rabbyConfirmTx(context);

    await page.reload();
    await page.waitForTimeout(1000);
  
    // Enter the amount and choose asset
    await page.locator('button', { hasText: /^HLS$/ }).click();
    const amount = (Math.random() * (max - min) + min).toFixed(4);
    await page.locator('input#amount').fill(amount.toString());
    await page.locator('button', { hasText: /^Withdraw now$/ }).click();

    // Double confirm and wait for the result
    await rabbyConfirmTx(context);
    await rabbyConfirmTx(context);
    await page.locator('div[data-color="success"]').waitFor({ state: 'visible' });
    Logger.ok(account, "bridge");

  } catch (err: unknown) {
    Logger.error(account, "bridge");
  } finally {
    await page.mouse.click(10, 10);
    await page.locator('span', { hasText: "…" }).click();
    await page.locator('button', { hasText: /^Logout$/ }).click();
    await page.close();
  }
}
