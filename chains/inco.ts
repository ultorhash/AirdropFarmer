import { BrowserContext } from "playwright";
import { rabbyConfirmTx, rabbyConnect } from "../utils/wallets";

export const comfy = async (context: BrowserContext, account: string) => {
  const percentages = [0.25, 0.5, 0.75, 1];
  const assets = ['cusdc', 'usdc'];

  const page = await context.newPage();
  page.goto("https://comfy.inco.org/");
  await page.waitForLoadState('domcontentloaded');

  // Randomize asset order
  assets.sort(() => Math.random() - 0.5);

  // Randomize amount to mint
  const usdcAmount = Math.floor(Math.random() * 100) + 1;
  await page.waitForTimeout(100);
  const cusdcAmount = Math.floor(Math.random() * 100) + 1;

  // Randomize amount to shield
  const shieldAmount = Math.round(percentages[Math.floor(Math.random() * percentages.length)] * usdcAmount);

  for (let i = 0; i < assets.length; i++) {
    await page.locator('button').filter({ hasText: /^Mint now$/ }).click();
    await page.click(`label[for="${assets[i]}"]`);

    const amount = assets[i] === "usdc" ? usdcAmount : cusdcAmount;
    await page.locator('input[placeholder="Enter Amount"]').fill(amount.toString());
    await page.locator('button').filter({ hasText: /^Mint$/ }).click();
    await rabbyConfirmTx(context);

    // Double confirmation for cusdc
    if (assets[i] === "cusdc") {
      await rabbyConfirmTx(context);
    }

    // Wait between minting
    await page.waitForTimeout(2000);
  }
  
  await page.locator('button').filter({ hasText: /^Shield$/ }).click();
  await page.locator('input[placeholder="0"]').fill(shieldAmount.toString());
  await page.locator('button').filter({ hasText: /^Shield$/ }).nth(1).click();

  // Triple confirmation
  await rabbyConfirmTx(context);
  await rabbyConfirmTx(context);
  await rabbyConfirmTx(context);

  await page.waitForTimeout(3_000);
  await page.close();
}
