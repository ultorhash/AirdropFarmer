import { BrowserContext } from "playwright";
import { rabbyConfirmTx } from "../utils/wallets";
import { Logger } from "../utils/logger";
import { faker } from "@faker-js/faker";

export const dailyCheckIn = async (
  context: BrowserContext,
  account: string,
  minWaitSeconds: number,
  maxWaitSeconds: number
): Promise<void> => {
  const waitBetween = Math.floor(Math.random() * maxWaitSeconds * 1000) + (minWaitSeconds * 1000);
  const page = await context.newPage();
  page.goto("https://testnet.pharosnetwork.xyz/experience/");
  await page.waitForLoadState('domcontentloaded');

  try {
    await page.locator('button', { hasText: /^Check in$/ }).click();
    await page.waitForTimeout(waitBetween);
    Logger.ok(account, "daily check in");

  } catch (err: unknown) {
    Logger.error(account, "daily check in");
  } finally {
    await page.close();
  }
}

export const zenith = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  addLiquidity: boolean,
  faucet: boolean
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.zenithswap.xyz/swap");
  await page.waitForLoadState('domcontentloaded');

  try {
    // // Select token to swap
    // const tokens = ["USDC", "USDT", "wPHRS"];
    // const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    // await page.locator('button.open-currency-select-button').filter({ hasText: /^Select token$/ }).click();
    // await page.locator('div').filter({ hasText: new RegExp(`^${randomToken}$`) }).first().click();

    // // Enter the amount
    // const amount = (Math.random() * (max - min) + min).toFixed(5);
    // await page.locator('input#swap-currency-input[placeholder="0"]').fill(amount);

    // // Detect if swap or wrap
    // const wrapBtn = await page.waitForSelector('[data-testid="wrap-button"]', { timeout: 3000 }).catch(() => null);
    // if (wrapBtn) {
    //   await wrapBtn.click();
    // } else {
    //   await page.waitForSelector('#swap-button').then(() => page.click('#swap-button'));
    //   await page.locator('[data-testid="confirm-swap-button"]').click();
    // }

    // await rabbyConfirmTx(context);
    // Logger.ok(account, "zenith swap");

    if (addLiquidity) {
      await page.mouse.click(10, 10);
      const supplyTokens = ["USDC", "USDT"];
      const randomSupplyToken = supplyTokens[Math.floor(Math.random() * supplyTokens.length)]
      await page.locator('a[href="/pool"]').first().click();
      await page.waitForTimeout(1000);
      await page.locator('[data-cy="join-pool-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('button.open-currency-select-button').nth(1).click();
      await page.waitForTimeout(1000);
      await page.locator(`[data-testid="common-base-${randomSupplyToken}"]`).first().click();
      await page.locator('div').filter({ hasText: /^Best for most pairs.$/ }).click();

      const balance = +(await page.locator('div').filter({ hasText: "Balance" }).last().innerText()).replace("Balance: ", "");

      // Skip if account does not have asset in pair with PHRS
      if (balance === 0) {
        Logger.warn(account, `zenith insufficient ${randomSupplyToken} for liquidity`);
        return;
      }

      // Calculate percentage of the supply
      const percentages = [0.25, 0.5, 0.75];
      const randomPercentage = percentages[Math.floor(Math.random() * percentages.length)];
      const amount = (balance * randomPercentage).toFixed(3);
      await page.locator('input.token-amount-input').last().fill(amount.toString());

      // Check if can supply
      const previewBtn = page.locator('button', { hasText: /^Preview$/ });
      const canPreview = await previewBtn.isEnabled();

      // Approve if needed
      if (!canPreview) {
        await page.locator('button').filter({ hasText: new RegExp(`^Approve ${randomSupplyToken}$`) }).click();
        await rabbyConfirmTx(context);
        Logger.ok(account, "zenith token approval");
      }

      await previewBtn.click();
      //
      await page.locator('button').filter({ hasText: /^Add$/ }).click();
      await rabbyConfirmTx(context);

      Logger.ok(account, "zenith liquidity provided");
    }

    if (faucet) {
      // Request faucet
      await page.locator('a[href="/faucet"]').first().click();
      await page.locator('span', { hasText: /^Request Token$/ }).click();
      await page.waitForTimeout(2000);
      await page.mouse.click(10, 10);

      //Swap to PHRS
      await page.locator('a[href="/swap"]').first().click();
      await page.locator('button.open-currency-select-button').first().click();
      await page.locator('[data-testid="common-base-USDC"]').first().click();
      await page.waitForTimeout(500);
      await page.locator('button.open-currency-select-button').nth(1).click();
      await page.locator('[data-testid="common-base-PHRS"]').first().click();
      
      const amount = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
      await page.locator('input#swap-currency-input[placeholder="0"]').fill(amount.toString());

      await page.waitForSelector('#swap-button').then(() => page.click('#swap-button'));
      const swapBtnText = await page.locator('[data-testid="confirm-swap-button"]').innerText();
      await page.locator('[data-testid="confirm-swap-button"]').click();
     
      if (swapBtnText.toLowerCase().includes('approve')) {
        await rabbyConfirmTx(context);
      }

      await rabbyConfirmTx(context);
    }
    
  } catch (err: unknown) {
    Logger.error(account, "zenith swap");
  } finally {
    page.close();
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
