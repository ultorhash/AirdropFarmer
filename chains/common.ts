import { BrowserContext } from "playwright";
import { Logger } from "../utils/logger";
import { rabbyConfirmTx } from "../utils/wallets";

export const onchaingm = async (
  context: BrowserContext,
  account: string,
  minWaitSeconds: number,
  maxWaitSeconds: number,
  network: string,
  chainId: number,
  skipGM: boolean
): Promise<void> => {
  const waitBetween = Math.floor(Math.random() * maxWaitSeconds * 1000) + (minWaitSeconds * 1000);
  const page = await context.newPage();

  try {
    page.goto("https://onchaingm.com");
    await page.waitForLoadState('domcontentloaded');

    if (!skipGM) {
      await page.locator('button').filter({ hasText: /^Testnet$/ }).click();
      await page.locator('span').filter({ hasText: new RegExp(`^GM on ${network}$`) }).nth(1).click();
      
      await rabbyConfirmTx(context);
      await page.mouse.click(10, 10);
      Logger.ok(account, `onchaingm GM`);

      await page.waitForTimeout(waitBetween);
    }

    await page.locator('span').filter({ hasText: /^Deploy$/ }).click();
    await page.locator('button').filter({ hasText: /^Testnet$/ }).click();
    await page.locator(`[data-network-id="${chainId}"] span.truncate`).filter({ hasText: /^Deploy$/ }).click();

    await rabbyConfirmTx(context);
    await page.close();

    Logger.ok(account, `onchaingm contract deployment`);
  } catch (err: unknown) {
    Logger.error(account, "onchaingm");
    await page.close();
  }
}
