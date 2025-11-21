import { BrowserContext } from "playwright";
import { rabbyConfirmTx } from "../utils/wallets";
import { Logger } from "../utils/logger";

export class IOPn {
  public static swap = async (
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
      Logger.error(account, "IOPn swap");
    } finally {
      await page.close();
    }
  }

  public static liquidity = async (context: BrowserContext, account: string): Promise<void> => {
    const page = await context.newPage();
    page.goto("https://swap.iopn.tech/");
    await page.waitForLoadState('domcontentloaded');
    await page.locator('button:has-text("Liquidity")').click();

    try {
      const tokens = ["tUSDT", "tBNB", "OPNT"];
      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

      if (randomToken !== "OPNT") {
        await page.locator(`img[alt="OPNT"]`).click();
        await page.locator('div.text-white.font-semibold', { hasText: randomToken }).click();
      }

      await page.locator('button:has-text("MAX")').last().click();
      await page.waitForTimeout(1000);

      const balance = await page.locator('input[placeholder="0.0"]').last().inputValue();
      const amount15PercentRounded12 = (+balance * 0.15).toFixed(12);

      await page.locator('input[placeholder="0.0"]').last().fill(amount15PercentRounded12);
      await page.locator('button.bg-gradient-to-r.from-purple-500.to-pink-500:has-text("Add Liquidity")').click();

      await rabbyConfirmTx(context);

      const statusText = await page.locator('div[role="status"][aria-live="polite"]').textContent();

      if (statusText.includes("approval")) {
        await rabbyConfirmTx(context);
      }
      
      Logger.ok(account, `IOPn liquidity IOPn + ${randomToken}`);

    } catch (err: unknown) {
      Logger.error(account, "IOPn liquidity");
    } finally {
      await page.close();
    }
  }
}

//https://rwa.iopn.tech/realestate
