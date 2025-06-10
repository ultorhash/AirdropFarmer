import { BrowserContext } from "playwright";

export const lendFinance = async (
  context: BrowserContext,
  account: string
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.zenithswap.xyz/swap");
  await page.waitForLoadState('domcontentloaded');
}
