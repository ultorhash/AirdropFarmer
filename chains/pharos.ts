import { BrowserContext } from "playwright";
import { rabbyConfirmTx } from "../utils/wallets";
import { Logger } from "../utils/logger";
import { Action } from "../enums";

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
  action: Action
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.zenithswap.xyz/swap");
  await page.waitForLoadState('domcontentloaded');

  const tokens = ["USDC", "USDT", "wPHRS"];
  const supplyTokens = ["USDC", "USDT"];
  const percentages = [0.25, 0.5, 0.75];

  const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
  const randomSupplyToken = supplyTokens[Math.floor(Math.random() * supplyTokens.length)];
  const randomPercentage = percentages[Math.floor(Math.random() * percentages.length)];

  let amount: number = 0;

  try {
    switch (action) {
      case Action.SWAP:
        await page.locator('button.open-currency-select-button').filter({ hasText: /^Select token$/ }).click();
        await page.locator('div').filter({ hasText: new RegExp(`^${randomToken}$`) }).first().click();

        amount = +(Math.random() * (max - min) + min).toFixed(5);
        await page.locator('input#swap-currency-input[placeholder="0"]').fill(amount.toString());

        const wrapBtn = await page.waitForSelector('[data-testid="wrap-button"]', { timeout: 3000 }).catch(() => null);

        if (wrapBtn) {
          await wrapBtn.click();
        } else {
          await page.waitForSelector('#swap-button').then(() => page.click('#swap-button'));
          await page.locator('[data-testid="confirm-swap-button"]').click();
        }

        await rabbyConfirmTx(context);

        Logger.ok(account, "zenith swap");
        break;
      case Action.LIQUIDITY:
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
        amount = +(balance * randomPercentage).toFixed(3);
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
        await page.locator('button').filter({ hasText: /^Add$/ }).click();
        await rabbyConfirmTx(context);

        Logger.ok(account, "zenith liquidity provided");
        break;
      case Action.FAUCET:
        await page.locator('a[href="/faucet"]').first().click();
        await page.locator('span', { hasText: /^Request Token$/ }).click();
        await page.waitForTimeout(10_000);
        await page.mouse.click(10, 10);

        await page.locator('a[href="/swap"]').first().click();
        await page.locator('button.open-currency-select-button').first().click();
        await page.locator('[data-testid="common-base-USDC"]').first().click();
        await page.waitForTimeout(500);
        await page.locator('button.open-currency-select-button').nth(1).click();
        await page.locator('[data-testid="common-base-PHRS"]').first().click();
        
        amount = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
        await page.locator('input#swap-currency-input[placeholder="0"]').fill(amount.toString());

        await page.waitForSelector('#swap-button').then(() => page.click('#swap-button'));
        const swapBtn = page.locator('[data-testid="confirm-swap-button"]');
        const swapBtnText = await swapBtn.innerText();
        await swapBtn.click();

        console.log("TEXT", swapBtnText);
      
        if (swapBtnText.toLowerCase().includes('approve')) {
          await rabbyConfirmTx(context);
        }

        await rabbyConfirmTx(context);

        Logger.ok(account, "zenith faucet");
        break;
      default:
        throw new Error("Action not defined!");
    }
    
  } catch (err: unknown) {
    Logger.error(account, `zenith ${action.toLowerCase()}`);
  } finally {
    page.close();
  }
}

export const faroswap = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  action: Action
) => {
  const page = await context.newPage();
  page.goto("https://faroswap.xyz/");
  await page.waitForLoadState('domcontentloaded');

  await page.waitForTimeout(1_000_000);
}

export const turing = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  action: Action
) => {
  const page = await context.newPage();
  page.goto("https://app.turing.finance/");
  await page.waitForLoadState('networkidle');

  // TODO: Remove after dapp is well integrated
  await page.waitForTimeout(2000);
  await page.mouse.click(10, 10);
  await page.waitForTimeout(2000);

  const amount = +(Math.random() * (max - min) + min).toFixed(5);
  await page.locator('input').first().fill(amount.toString());
  await page.locator('button', { hasText: /^Mint$/ }).click();
  await rabbyConfirmTx(context);

  // Wait for minted tokens
  await page.waitForTimeout(3000);
  await page.mouse.click(10, 10);

  await page.locator('a[href="/stake"]').first().click();
  await page.waitForTimeout(1000);
  const balance = await page.locator('span.text-\\[\\#7d7d7d\\] span.text-black').first().textContent();

  const percentages = [0.25, 0.5, 0.75];
  const randomPercentage = percentages[Math.floor(Math.random() * percentages.length)];
  const stakeAmount = +(+balance * randomPercentage).toFixed(5);

  await page.locator('input').first().fill(stakeAmount.toString());
  await page.locator('button', { hasText: /^Approve$/ }).click();

  // Approve exact amount and stake
  await rabbyConfirmTx(context);
  await page.waitForTimeout(3000);
  await page.mouse.click(10, 10);
  await page.locator('button', { hasText: /^Stake$/ }).nth(1).click();
  await rabbyConfirmTx(context);
}

export const infiexchange = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  action: Action
) => {
  const page = await context.newPage();
  page.goto("https://testnet.infiexchange.xyz/faucet");
  await page.waitForLoadState('domcontentloaded');

  const tokens = ["GOCTO", "INFI"];

  // await page.locator('button', { hasText: /^Request GOCTO$/ }).click();
  // await page.locator('button', { hasText: "Wait" }).waitFor({ state: 'visible' });

  await page.locator('a[href="/swap"]').first().click();

  const amount = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
  await page.locator('input[placeholder="0"]').first().fill(amount.toString());
  await page.waitForTimeout(2000)

  console.log(await page.locator('button', { hasText: /^Approve & Swap$/ }).count());
  console.log(await page.locator('button', { hasText: /^Swap$/ }).count());

  await page.locator('svg[stroke="currentColor"]').nth(3).click();
  await page.locator('div.flex.items-center.p-3.cursor-pointer.rounded-lg > div > div').nth(4).filter({ hasText: /^GOCTO$/ }).click();
  await page.waitForTimeout(1000);
  await page.locator('svg[stroke="currentColor"]').nth(5).click();
  await page.locator('div.flex.items-center.p-3.cursor-pointer.rounded-lg > div > div').nth(4).filter({ hasText: /^IFNI$/ }).click();

  // Approve & Swap
  // Swap
  //await page.locator('button', { hasText: /^Request GOCTO$/ }).click();

  await page.waitForTimeout(1_000_000);
}

//https://appv2.fufuture.io/u/trade
//https://app.moveflow.xyz/

