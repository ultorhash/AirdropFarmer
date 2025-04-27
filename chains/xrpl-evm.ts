import { BrowserContext } from "playwright";
import { confirmTx, connectWallet } from "../helpers";
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

export const moaiFinance = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  try {
    const page = await context.newPage();
    await page.goto("https://xrplevm.moai-finance.xyz/swap");
    await page.waitForLoadState('networkidle');

    // INVESTIGATE: Need to connect wallet every session regardless being connected previously
    // await page.locator('button').filter({ hasText: /^Connect Wallet$/ }).first().click();
    // await page.locator('button:has-text("Browser wallet")').first().click({ force: true });
    // await page.locator('text="MetaMask"').click();

    // await connectWallet(context);

    // No approval, swap XRP to RLUSD
    const amount = (Math.random() * (max - min) + min).toFixed(2);
    await page.locator('input.mantine-Input-input').first().fill(amount);

    //await page.locator('[data-button="true"]').last().scrollIntoViewIfNeeded();
    const swapButton = page.locator('[data-button="true"]').last();
    await swapButton.waitFor({ state: 'visible' });
    await swapButton.click();
    //

    // Approve high price impact
    await page.locator('input[type="checkbox"]').click();
    await page.locator('span:has-text("Swap anyway")').click();
    //

    await confirmTx(context);

    // const btns = await page.locator('div.token-button').nth(1).click();
    // console.log(btns); // 2

    Logger.ok(account, "moai finance");
    await page.close();

  } catch (err: unknown) {
    Logger.error(account, "moai finance");
  }
}
