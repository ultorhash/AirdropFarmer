import { BrowserContext } from "playwright";
import { Logger } from "../utils/logger";
import { rabbyConfirmTx } from "../utils/wallets";
import { faker } from "@faker-js/faker";

export const onchaingm = async (
  context: BrowserContext,
  account: string,
  minWaitSeconds: number,
  maxWaitSeconds: number,
  network: string,
  chainId: number,
  gm: boolean
): Promise<void> => {
  const waitBetween = Math.floor(Math.random() * maxWaitSeconds * 1000) + (minWaitSeconds * 1000);
  const page = await context.newPage();

  try {
    page.goto("https://onchaingm.com");
    await page.waitForLoadState('domcontentloaded');

    if (gm) {
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

export const mintair = async (context: BrowserContext, account: string): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://contracts.mintair.xyz/");
  await page.waitForLoadState('networkidle');

  try {
    // Select random option
    const options = ['timer', 'token'];
    const option = options[Math.floor(Math.random() * options.length)];
    await page.locator('button').filter({ hasText: new RegExp(`^${option}$`) }).click();

    if (option === 'token') {
      const name = faker.word.noun();
      const firstLetter = name[0].toUpperCase();

      const remainingLetters = [...new Set(name.slice(1))]; 
      const randomLetters = remainingLetters
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const ticker = firstLetter + randomLetters;

      await page.locator('input[placeholder="Name"]').fill(name);
      await page.locator('input[placeholder="Symbol"]').fill(ticker);
    }

    // Deploy
    await page.locator('button').filter({ hasText: /^Deploy$/ }).click();
    await rabbyConfirmTx(context);
    Logger.ok(account, `mintair ${option} contract deployment`);
    
  } catch (err: unknown) {
    Logger.error(account, "mintair");
  } finally {
    page.close();
  }
}
