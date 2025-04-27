import { BrowserContext } from "playwright";
import { confirmTx } from "../helpers";
import { Logger } from "../utils/logger";

export const hammyFinance = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  try {
    const page = await context.newPage();
    await page.goto("https://hammy.finance");
    await page.waitForLoadState('networkidle');

    // Select random tokens to swap
    const tokens = [1, 2, 3];
    const shuffled = tokens.sort(() => 0.5 - Math.random());
    const selectedTokens = shuffled.slice(0, 2);

    // Approve all tokens manually for the first time!
    // Select tokens and input amount
    await page.locator('div.flex.items-center.gap-2 > button').first().click();
    await page.locator(`[tabindex="${selectedTokens[0]}"]`).click();

    await page.locator('div.flex.items-center.gap-2 > button').nth(1).click();
    await page.locator(`[tabindex="${selectedTokens[1]}"]`).click();

    const amount = (Math.random() * (max - min) + min).toFixed(1);
    await page.locator('input[placeholder="0.0"][type="text"]').first().fill(amount);
    //

    await page.locator('button:has-text("Swap")').scrollIntoViewIfNeeded();
    await page.locator('button:has-text("Swap")').click({ force: true });
    await confirmTx(context);

    Logger.ok(account, "hammy finance");
    await page.close();

  } catch (err: unknown) {
    Logger.error(account, "hammy finance");
  }
}
