import { BrowserContext } from "playwright";
import { rabbyConfirmTx, rabbyConnect } from "../utils/wallets";
import { Logger } from "../utils/logger";
import { Action } from "../enums";
import { addressPairs } from "../utils/addresses/address-pairs";

export const dailyCheckIn = async (
  context: BrowserContext,
  account: string,
  reauthenticate: boolean
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.pharosnetwork.xyz/experience/");
  await page.waitForLoadState('domcontentloaded');

  try {
    if (reauthenticate) {
      // Connect wallet
      await page.locator('button', { hasText: /^Connect Wallet$/ }).click();
      await page.click('text=Rabby Wallet');
      await rabbyConnect(context, true);
      await page.waitForTimeout(1000);

      // Sign authority
      await page.locator('button', { hasText: /^Continue$/ }).click();
      await rabbyConfirmTx(context);
    }

    await page.locator('button', { hasText: /^Check in$/ }).click();
    await page.waitForTimeout(3500);
    Logger.ok(account, "daily check in");

    if (reauthenticate) {
      // Logout
      await page.locator('span', { hasText: "..." }).click();
      await page.locator('span', { hasText: /^Disconnect$/ }).click();
      await page.waitForTimeout(2000);
    }
  } catch (err: unknown) {
    Logger.error(account, "daily check in");
  } finally {
    await page.close();
  }
}


export const sendToFriend = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  reauthenticate: boolean
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.pharosnetwork.xyz/experience/");
  await page.waitForLoadState('domcontentloaded');

  try {
    // Find receiver
    let recipientAddress: string = "";
    const currentAddress = await page.locator('span', { hasText: "..." }).innerText()
    const [prefix, suffix] = currentAddress.split('...');
    
    for (const key of addressPairs.keys()) {
      if (key.startsWith(prefix) && key.endsWith(suffix)) {
        recipientAddress = addressPairs.get(key);
      }
    }

    const amount = +(Math.random() * (max - min) + min).toFixed(6);

    // Fill in the form
    await page.locator('button', { hasText: /^Send$/ }).click();
    await page.locator('input[placeholder="0.0"]').fill(amount.toString());
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder="Enter Address"]').fill(recipientAddress);
    await page.waitForTimeout(1000);
    await page.locator('button', { hasText: /^Send PHRS$/ }).click();
    
    await rabbyConfirmTx(context);
    Logger.ok(account, "send to friend");
  } catch (err: unknown) {
    Logger.error(account, "send to friend");
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

  const tokens = ["USDC", "USDT"]; // wPHRS
  const supplyTokens = ["USDC", "USDT"];

  const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
  const randomSupplyToken = supplyTokens[Math.floor(Math.random() * supplyTokens.length)];

  try {
    switch (action) {
      case Action.SWAP:
        await page.locator('button.open-currency-select-button').filter({ hasText: /^Select token$/ }).click();
        await page.locator('div').filter({ hasText: new RegExp(`^${randomToken}$`) }).first().click();

        const amount = +(Math.random() * (max - min) + min).toFixed(5);
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
      case Action.SELL:
        await page.locator('button.open-currency-select-button').filter({ hasText: /^Select token$/ }).click();
        await page.locator('div').filter({ hasText: new RegExp(`^${randomToken}$`) }).first().click();
        await page.locator('[data-testid="swap-currency-button"]').click();
        
        await page.locator('[data-testid="balance-text"]').first().waitFor({ state: 'visible' });
        const sellBalance = parseFloat((await page.locator('[data-testid="balance-text"]').first().innerText()).replace(/,/g, ''));
        
        const sellPercentages = [1];
        const sellRandomPercentage = sellPercentages[Math.floor(Math.random() * sellPercentages.length)];
        const sellAmount = +(sellBalance * sellRandomPercentage).toFixed(4);

        await page.locator('input#swap-currency-input[placeholder="0"]').fill(sellAmount.toString());
        const unwrapBtn = await page.waitForSelector('[data-testid="wrap-button"]', { timeout: 3000 }).catch(() => null);

        if (unwrapBtn) {
          await unwrapBtn.click();
        } else {
          await page.waitForSelector('#swap-button').then(() => page.click('#swap-button'));

          const confirmBtn = page.locator('[data-testid="confirm-swap-button"]');
          const confirmBtnText = await confirmBtn.innerText();
          await confirmBtn.click();

          // Check if approval needed
          if (confirmBtnText.toLowerCase().includes("approve")) {
            await rabbyConfirmTx(context);
          }
        }
        
        await rabbyConfirmTx(context);

        Logger.ok(account, "zenith sell");
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

        await page.locator('div', { hasText: /^Full range$/ }).first().click();

        // Calculate percentage of the supply
        const percentages = [0.005, 0.01, 0.02];
        const randomPercentage = percentages[Math.floor(Math.random() * percentages.length)];
        const supplyAmount = +(balance * randomPercentage).toFixed(4);
        await page.locator('input.token-amount-input').last().fill(supplyAmount.toString());

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
        
        const faucetAmount = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
        await page.locator('input#swap-currency-input[placeholder="0"]').fill(faucetAmount.toString());

        await page.waitForSelector('#swap-button').then(() => page.click('#swap-button'));
        const swapBtn = page.locator('[data-testid="confirm-swap-button"]');
        const swapBtnText = await swapBtn.innerText();
        await swapBtn.click();
      
        // Check if approval needed
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
    await page.close();
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

  const percentages = [0.25, 0.5, 0.75, 1];
  const randomPercentage = percentages[Math.floor(Math.random() * percentages.length)];

  try {
    // TODO: Remove after dapp is well integrated
    await page.waitForTimeout(2000);
    await page.mouse.click(10, 10);
    await page.waitForTimeout(2000);

    switch (action) {
      case Action.MINT:
        const amount = +(Math.random() * (max - min) + min).toFixed(5);
        await page.locator('input').first().fill(amount.toString());
        await page.locator('button', { hasText: /^Mint$/ }).click();
        await rabbyConfirmTx(context);
        Logger.ok(account, "turing mint");
        break;
      case Action.STAKE:
        await page.locator('a[href="/stake"]').first().click();
        const stakeBalance = await page.locator('span.text-\\[\\#7d7d7d\\] span.text-black').first().textContent();
        const stakeAmount = +(+stakeBalance * randomPercentage).toFixed(5);

        // Approve exact amount
        await page.locator('input').first().fill(stakeAmount.toString());
        await page.locator('button', { hasText: /^Approve$/ }).click();
        await rabbyConfirmTx(context);

        await page.waitForTimeout(3000);
        await page.mouse.click(10, 10);

        // Stake
        await page.locator('button', { hasText: /^Stake$/ }).nth(1).click();
        await rabbyConfirmTx(context);
        Logger.ok(account, "turing stake");
        break;
      case Action.REDEEM:
        await page.locator('a[href="/redeem"]').first().click();
        const redeemBalance = await page.locator('span.text-\\[\\#7d7d7d\\] span.text-black').first().textContent();
        const redeemAmount = +(+redeemBalance * randomPercentage).toFixed(5);

        // Approve exact amount
        await page.locator('input').first().fill(redeemAmount.toString());
        await page.locator('button', { hasText: /^Approve$/ }).click();
        await rabbyConfirmTx(context);

        await page.locator('button', { hasText: /^Request$/ }).first().click();
        await rabbyConfirmTx(context);
        Logger.ok(account, "turing redeem request");
        break;
      default:
        throw new Error("Action not defined!");
    }
  } catch (err: unknown) {
    Logger.error(account, "turing");
  } finally {
    await page.close();
  }
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

export const gotchipus = async (
  context: BrowserContext,
  account: string
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://gotchipus.com/");
  await page.waitForLoadState('domcontentloaded');

  try {
    await page.locator('img[alt="Mint"]').click();
    await page.locator('text=Mint Now').click();
    await rabbyConfirmTx(context);
    await page.waitForTimeout(1000);

    Logger.ok(account, "gotchipus NFT");
  } catch (err: unknown) {
    Logger.error(account, "gotchipus NFT");
  } finally {
    await page.close();
  }
}

//https://appv2.fufuture.io/u/trade
//https://app.moveflow.xyz/

