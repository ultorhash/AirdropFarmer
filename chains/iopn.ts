import { BrowserContext } from "playwright";
import { Logger } from "../utils/logger";
import { Rabby } from "../utils/rabby";

export class IOPn {
  public static swap = async (
    context: BrowserContext,
    account: string,
    min: number,
    max: number,
    onlyNative: boolean
  ): Promise<void> => {
    const page = await context.newPage();
    page.goto("https://swap.iopn.tech/");
    await page.waitForLoadState('networkidle');

    try {
      const tokens = ["OPN", "tUSDT", "tBNB", "OPNT"];
      let fromToken = "";

      if (onlyNative) {
        fromToken = "OPN"
      } else {
        fromToken = tokens[Math.floor(Math.random() * tokens.length)];
      }

      const availableToTokens = tokens.filter(token => token !== fromToken);
      const toToken = availableToTokens[Math.floor(Math.random() * availableToTokens.length)];

      if (fromToken === "OPN" && toToken === "OPNT") {

        const amount = (Math.random() * (max - min) + min).toFixed(5);
        await page.locator('input[placeholder="0.0"]').first().fill(amount);

      } else if (fromToken === "OPNT" && toToken === "OPN") {

        await page.locator('button:has(svg.w-5.h-5.text-gray-400)').last().click();
        await page.locator('button:has-text("MAX")').last().click();
        await page.waitForTimeout(500);

        const balance = await page.locator('input[placeholder="0.0"]').first().inputValue();
        const amount20PercentRounded12 = (+balance * 0.2).toFixed(15);

        await page.locator('input[placeholder="0.0"]').first().fill(amount20PercentRounded12);

      } else if (fromToken === "OPN") {

        await page.locator(`img[alt="OPNT"]`).click();
        await page.locator('div.text-white.font-semibold', { hasText: new RegExp(`^${toToken}$`) }).click();

        const amount = (Math.random() * (max - min) + min).toFixed(5);
        await page.locator('input[placeholder="0.0"]').first().fill(amount);

      } else if (fromToken === "OPNT") {

        await page.locator(`img[alt="OPNT"]`).click();
        await page.locator('div.text-white.font-semibold', { hasText: new RegExp(`^${toToken}$`) }).click();
        await page.waitForTimeout(500);
        await page.locator(`img[alt="OPN"]`).click();
        await page.locator('div.text-white.font-semibold', { hasText: new RegExp(`^${fromToken}$`) }).click();
        await page.waitForTimeout(500);

        await page.locator('button:has-text("MAX")').last().click();
        await page.waitForTimeout(500);

        const balance = await page.locator('input[placeholder="0.0"]').first().inputValue();
        const amount20PercentRounded12 = (+balance * 0.2).toFixed(15);
        await page.locator('input[placeholder="0.0"]').first().fill(amount20PercentRounded12);

      } else if (toToken === "OPNT") {

        await page.locator(`img[alt="OPN"]`).click();
        await page.locator('div.text-white.font-semibold', { hasText: new RegExp(`^${fromToken}$`) }).click();
        await page.waitForTimeout(500);

        await page.locator('button:has-text("MAX")').last().click();
        await page.waitForTimeout(500);

        const balance = await page.locator('input[placeholder="0.0"]').first().inputValue();
        const amount20PercentRounded12 = (+balance * 0.2).toFixed(15);

        await page.locator('input[placeholder="0.0"]').first().fill(amount20PercentRounded12);

      } else {

        await page.locator(`img[alt="OPN"]`).click();
        await page.locator('div.text-white.font-semibold', { hasText: new RegExp(`^${fromToken}$`) }).click();
        await page.waitForTimeout(500);
        await page.locator(`img[alt="OPNT"]`).click();
        await page.locator('div.text-white.font-semibold', { hasText: new RegExp(`^${toToken}$`) }).click();
        await page.waitForTimeout(500);

        await page.locator('button:has-text("MAX")').last().click();
        await page.waitForTimeout(500);

        const balance = await page.locator('input[placeholder="0.0"]').first().inputValue();
        const amount20PercentRounded12 = (+balance * 0.2).toFixed(15);
        await page.locator('input[placeholder="0.0"]').first().fill(amount20PercentRounded12);

      }

      await page.waitForTimeout(200);
      await page.locator('button.glow-purple-lg:has-text("Swap")').click();

      await Rabby.confirmTxAsync(context);
      Logger.ok(account, `Swap from ${fromToken} to ${toToken}`);

    } catch (err: unknown) {
      Logger.error(account, "Swap");
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
        await page.locator('div.text-white.font-semibold', { hasText: new RegExp(`^${randomToken}$`) }).click();
      }

      await page.locator('button:has-text("MAX")').last().click();
      await page.waitForTimeout(1000);

      const balance = await page.locator('input[placeholder="0.0"]').last().inputValue();
      const amount15PercentRounded12 = (+balance * 0.15).toFixed(15);

      await page.locator('input[placeholder="0.0"]').last().fill(amount15PercentRounded12);
      await page.locator('button.bg-gradient-to-r.from-purple-500.to-pink-500:has-text("Add Liquidity")').click();

      await Rabby.confirmTxAsync(context);

      const statusText = await page.locator('div[role="status"][aria-live="polite"]').textContent();

      if (statusText.includes("approval")) {
        await Rabby.confirmTxAsync(context);
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
