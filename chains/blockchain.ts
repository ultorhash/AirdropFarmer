import { BrowserContext } from "playwright";
import { rabbyConfirmTx } from "../utils/wallets";
import { Logger } from "../utils/logger";

export const raribleMint = async (context: BrowserContext, account: string): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://rarible.fun/blockchainkek/collections/0x88d1244e6169b26cb70ed01db496f95dd323ea7d/drops");
  await page.waitForLoadState('domcontentloaded');

  try {
    await page.locator('[data-testid="mint-button"]').click();
    await rabbyConfirmTx(context);
    Logger.ok(account, "LOL/FUN mint");

  } catch (err: unknown) {
    Logger.error(account, "LOL/FUN mint");
  } finally {
    await page.close();
  }
}

export const blockSwap = async (
  context: BrowserContext,
  account: string,
  min: number,
  max: number
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://swap.block-chain.lol/#/swap?chain=blockchain_testnet");
  await page.waitForLoadState('domcontentloaded');

  const amount = (Math.random() * (max - min) + min).toFixed(5);
  const tokens: Record<string, string> = {
    BERA: "0x92aEDDaBb4Eb2A5b17d90bF6fF70b58227098E03",
    HONEY: "0x0458E6a7e3F8190AaB1e7862a57f47fc4b4e0315",
    WETH: "0x8F5ecfe14FC9F1938a0C2875bfBA825C97700ADe"
  };

  const keys = Object.keys(tokens);
  const randomToken = keys[Math.floor(Math.random() * keys.length)];

  try {
    await page.locator('button.open-currency-select-button').nth(1).click();
    await page.locator(`div.token-item-${tokens[randomToken]}`).click();
    await page.locator('input.token-amount-input').first().fill(amount);
    await page.locator('button#swap-button').click();
    await page.locator('div', { hasText: /^Confirm Swap$/ }).last().click();
    await rabbyConfirmTx(context);

    Logger.ok(account, `blockSwap swap BITCOIN -> ${randomToken}`);
  } catch (err: unknown) {
    Logger.error(account, "blockSwap");
  } finally {
    await page.close();
  }
}
