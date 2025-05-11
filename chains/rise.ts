import { BrowserContext, Locator } from "playwright";
import { clearActivity, confirmTx, connectWallet } from "../helpers";
import { Logger } from "../utils/logger";
import { metamaskConfirmTx, rabbyConfirmTx } from "../utils/wallets";
import { Action, LiquiditySize } from "../enums";

export const gaspump = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  action: Action,
  liquidityPair: string,
  liquiditySize = LiquiditySize.QUARTER
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://gaspump.network");
  await page.waitForLoadState('networkidle');

  try {
    switch (action) {
      case Action.SWAP:
        const amount = (Math.random() * (max - min) + min).toFixed(6);
        await page.locator('.base-Input-input').first().fill(amount);

        await page.locator('[data-testid="swap-review-btn"]').filter({ hasText: /^Review Swap$/ }).click();
        await page.locator('button.base-Button-root').filter({ hasText: /^Confirm swap$/ }).click();

        await rabbyConfirmTx(context);
        break;
      case Action.LIQUIDITY:
        const liquidityTokens = liquidityPair.split("/");

        // Search pair by tokens
        await page.locator('div').filter({ hasText: /^Pool$/ }).first().click();
        await page.locator('button').filter({ hasText: /^Search$/ }).click();
        await page.locator('div[data-testid="token-picker-item"] div')
          .filter({ hasText: new RegExp(`^${liquidityTokens[0]}$`) })
          .first()
          .click();

        await page.locator('button').filter({ hasText: /^Search$/ }).click();
        await page.locator('div[data-testid="token-picker-item"] div')
          .filter({ hasText: new RegExp(`^${liquidityTokens[1]}$`) })
          .first()
          .click();

        // Wait for the pools to load and pick the first one
        await page.waitForTimeout(3000);
        await page.locator('button').filter({ hasText: /^Add$/ }).first().click();

        // Enter the liquidity size and approve tokens
        await page.locator('button').filter({ hasText: new RegExp(`^${liquiditySize}$`)}).first().click();

        const needApprove = await page.locator('button').filter({ hasText: "Approve" }).count() > 0;
        if (needApprove) {
          await page.locator('button').filter({ hasText: new RegExp(`^Approve ${liquidityTokens[0]}$`) }).click();
          await rabbyConfirmTx(context);
          await page.locator('button').filter({ hasText: new RegExp(`^Approve ${liquidityTokens[1]}$`) }).click();
          await rabbyConfirmTx(context);
        }

        // Supply [css-ridtx hack, watch out for it]
        const supplyBtn = await page.locator('button.css-ridtx');
        await supplyBtn.scrollIntoViewIfNeeded();
        await supplyBtn.click();
        await page.locator('button').filter({ hasText: /^Confirm$/ }).first().click();
        await rabbyConfirmTx(context);
        break;
      default:
        throw new Error("Action not defined!");
    }

    await page.close();
  
    Logger.ok(account, `gaspump ${action}`);
  } catch (err: unknown) {
    Logger.error(account, "gaspump");
    page.close();
  }
}

export const clober = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number,
  action: Action
): Promise<void> => {
  const page = await context.newPage();
  await page.goto("https://rise.clober.io/trade?chain=11155931");
  await page.waitForLoadState('networkidle');

  try {
    let swapBtn: Locator;
    const amount = (Math.random() * (max - min) + min).toFixed(6);

    switch (action) {
      case Action.SWAP:
        await page.locator('input.flex-1').first().fill(amount);
        swapBtn = page.locator('button:has-text("Swap")').nth(2);
        break;
      case Action.WRAP:
        await page.locator('input.flex-1').first().fill(amount);
        swapBtn = page.locator('button:has-text("Wrap")').first();
        break;
      case Action.UNWRAP:
        await page.locator('button').filter({ hasText: /^MAX$/ }).first().click();
        swapBtn = page.locator('button:has-text("Unwrap")').first();
        break;
      default:
        throw new Error("Action not defined!");
    }

    await swapBtn.waitFor({ state: 'visible' });
    swapBtn.click();

    await rabbyConfirmTx(context);
    await page.close();

    Logger.ok(account, "clober");
  } catch (err: unknown) {
    Logger.error(account, "clober");
    page.close();
  }
}

export const cloberRabby = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  await page.goto("https://rise.clober.io/trade?chain=11155931");
  await page.waitForLoadState('networkidle');
}

export const inarifi = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  try {
    const page = await context.newPage();
    page.goto("https://www.inarifi.com/?marketName=proto_inari_rise");
    await page.waitForLoadState('networkidle');

    // Find asset to deposit
    await page.locator('a[href*="/markets"]').click();
    await page.locator('a[href*="/reserve-overview/?underlyingAsset=0x4200000000000000000000000000000000000006&marketName=proto_inari_rise"]').click();

    // Enter the amount
    await page.locator('[data-cy="supplyButton"]').click();
    const amount = (Math.random() * (max - min) + min).toFixed(6);
    await page.locator('input[aria-label="amount input"]').fill(amount);

    // Wait for gas cost estimation
    await page.waitForFunction(() => !document.querySelector('svg[data-testid="LocalGasStationIcon"] + span[role="progressbar"]'));

    // Check if approval needed
    const supplyBtn = page.locator('[data-cy="actionButton"]');
    const isSupplyDisabled = await supplyBtn.evaluate(el => el.hasAttribute('disabled'));

    // Approve if needed and deposit again
    if (isSupplyDisabled) {
      await page.locator('[data-cy="approvalButton"]').click();
      await rabbyConfirmTx(context);
      await page.mouse.click(100, 100);
      await page.waitForTimeout(1500);

      await page.locator('[data-cy="supplyButton"]').click();
      await page.locator('input[aria-label="amount input"]').fill(amount);

      await page.waitForFunction(() => !document.querySelector('svg[data-testid="LocalGasStationIcon"] + span[role="progressbar"]'));
    }

    await supplyBtn.click();
    await rabbyConfirmTx(context);
    await page.close();

    Logger.ok(account, "inafiri");
  } catch (error: unknown) {
    Logger.error(account, "inafiri");
  }
}

export const b3x = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  try {
    const page = await context.newPage();
    page.goto("https://testnet.b3x.ai/#/trade");
    await page.waitForLoadState('networkidle');

    let tradeType: string;

    // Select tokens
    await page.locator('span.Token-symbol-text').first().click();
    await page.click('img[alt="WSTETH"]');
    await page.locator('span.Token-symbol-text').nth(1).click();
    await page.click('img[alt="XRP/USD"]');
    //

    // Switch from previous trade type E.g. Long -> Short
    const isLongSelected = await page.locator('div.Tab-option').evaluateAll(el => {
      return el.some((el: HTMLElement) => el.getAttribute('class')?.includes('active') && el.innerText.includes('Long'));
    });

    if (isLongSelected) {
      await page.locator('span.boldFont').filter({ hasText: 'Short' }).click();
      tradeType = "Short";

    } else {
      await page.locator('span.boldFont').filter({ hasText: 'Long' }).click();
      tradeType = "Long";
    }
    //

    // Enter the amount and long
    const amount = (Math.random() * (max - min) + min).toFixed(6);
    await page.locator('input.Exchange-swap-input').first().fill(amount);
    await page.locator('button').filter({ hasText: new RegExp(`^${tradeType} XRP$`) }).click();
    await page.locator('button').filter({ hasText: new RegExp(`^${tradeType}$`) }).click();
    //

    await confirmTx(context);
    await page.waitForTimeout(2000);
    await page.close();

    Logger.ok(account, `b3x [position: ${tradeType}]`);
  } catch (error: unknown) {
    Logger.error(account, "b3x");
  }
}

export const onchaingm = async (
  context: BrowserContext,
  account: string,
  minWaitSeconds: number,
  maxWaitSeconds: number,
  skipGM: boolean
): Promise<void> => {
  try {
    const waitBetween = Math.floor(Math.random() * maxWaitSeconds * 1000) + (minWaitSeconds * 1000);
    const page = await context.newPage();
    page.goto("https://onchaingm.com");
    await page.waitForLoadState('domcontentloaded');

    if (!skipGM) {
      await page.locator('button').filter({ hasText: /^Testnet$/ }).click();
      await page.locator('span').filter({ hasText: /^GM on RISE$/ }).nth(1).click();
      
      await rabbyConfirmTx(context);
      await page.mouse.click(10, 10);
      Logger.ok(account, `onchaingm GM`);

      await page.waitForTimeout(waitBetween);
    }

    await page.locator('span').filter({ hasText: /^Deploy$/ }).click();
    await page.locator('button').filter({ hasText: /^Testnet$/ }).click();
    await page.locator('[data-network-id="11155931"] span.truncate').filter({ hasText: /^Deploy$/ }).click();

    await rabbyConfirmTx(context);
    await page.close();

    Logger.ok(account, `onchaingm contract deployment`);
  } catch (error: unknown) {
    Logger.error(account, "onchaingm");
  }
}
