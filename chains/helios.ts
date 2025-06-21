import { BrowserContext } from "playwright";
import { Action } from "../enums";
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
