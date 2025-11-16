import { BrowserContext } from "playwright";
import { rabbyConfirmTx } from "../utils/wallets";
import { Logger } from "../utils/logger";

export const iopnSwap = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://swap.iopn.tech/");
  await page.waitForLoadState('domcontentloaded');

  try {
    const tokens = ["tUSDT", "tBNB", "OPNT"];
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

    if (randomToken !== "OPNT") {
      await page.locator(`img[alt="OPNT"]`).click();
      await page.locator('div.text-white.font-semibold', { hasText: randomToken }).click();
    }

    const amount = (Math.random() * (max - min) + min).toFixed(5);
    await page.locator('input[placeholder="0.0"]').first().fill(amount);
    await page.locator('button.glow-purple-lg:has-text("Swap")').click();

    await rabbyConfirmTx(context);
    Logger.ok(account, `IOPn swap for ${randomToken}`);

  } catch (err: unknown) {
    console.log(err)
    Logger.error(account, "IOPn swap");
  } finally {
    await page.close();
  }
}
