import { BrowserContext } from "playwright";
import { rabbyConfirmTx } from "../utils/wallets";
import { Logger } from "../utils/logger";

export const rover = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  try {
    page.goto("https://testnet.roverstaking.com/stake");
    await page.waitForLoadState('networkidle');

    const amount = Math.random() * (max - min) + min;
    await page.locator('input[placeholder="0.00"]').fill(amount.toString());
    await page.locator('button').filter({ hasText: /^STAKE BTC$/ }).click();

    await rabbyConfirmTx(context);
    await page.close();
    Logger.ok(account, "rover");
  
  } catch (err: unknown) {
    Logger.error(account, "rover");
    page.close();
  }
}

export const arch = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  try {
    page.goto("https://testnet.arch.fi/swap");
    await page.waitForLoadState('domcontentloaded');

    await page.locator('button').filter({ hasText: /^I Understand$/ }).click();

    const amount = Math.random() * (max - min) + min;
    await page.locator('input[placeholder="0.0"]').first().fill(amount.toString());

    // Wait for quote
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: /^Swap$/ }).click();
    
    await rabbyConfirmTx(context);
    await page.close();
    Logger.ok(account, "arch");
  
  } catch (err: unknown) {
    Logger.error(account, "arch");
    page.close();
  }
}

export const bitzy = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://bitzy-testnet.vercel.app/swap");
  await page.waitForLoadState('domcontentloaded');

  // Wait for potential sign in popup
  await Promise.race([rabbyConfirmTx(context), new Promise((resolve) => setTimeout(() => resolve(null), 5000))]);

  const container = page.locator('div.font-montserrat.flex.flex-row.gap-1.text-sm.font-semibold.cursor-pointer.cursor-pointer');
  const balance = container.locator('.text-bitzy-theme-white').first();

  // Wait for balance to load
  await page.waitForFunction((span) => span.textContent.trim() !== "0", await balance.elementHandle());

  const amount = Math.random() * (max - min) + min;
  await page.locator('input[placeholder="0"]').first().fill(amount.toString());
  await page.locator('button').filter({ hasText: /^Swap$/ }).click();
  await page.waitForTimeout(3000);

  // Check if working
  const errorMessageLocator = page.locator('span:has-text("The is an issue with fetching. Please wait 5-10 seconds and submit the transaction again")');
  const errorMessageTimeout = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
  const errorMessageElement = await Promise.race([
    errorMessageLocator.waitFor({ state: 'visible' }),
    errorMessageTimeout
  ]);
  
  console.log("Result:", errorMessageElement)

  if (errorMessageElement) {
    await page.mouse.click(10, 10);
    await page.locator('button').filter({ hasText: /^Swap$/ }).click();
  }

  await rabbyConfirmTx(context);

  await page.waitForTimeout(2_000_000);
}
