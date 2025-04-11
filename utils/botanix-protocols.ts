import { BrowserContext } from "playwright";

export const rover = async (context: BrowserContext): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://testnet.roverstaking.com/stake");
  await page.waitForLoadState('domcontentloaded');

  page.locator('text="CONNECT WALLET"').click();
  page.locator('text="MetaMask"').click();

  const [connectPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await connectPopup.waitForLoadState('domcontentloaded');
  const connect = await connectPopup.waitForSelector('[data-testid="confirm-btn"]');
  connect.click();

  await connectPopup.waitForEvent('close');

  const input = page.locator('input[placeholder="0.00"]');
  const randomNumber = Math.random() * (0.00004 - 0.00001) + 0.00001;
  const roundedNumber = parseFloat(randomNumber.toFixed(5));
  await input.fill(roundedNumber.toString());

  page.locator('text="STAKE BTC"').click();

  const [txPopup] = await Promise.all([
    context.waitForEvent('page')
  ]);

  await txPopup.waitForLoadState('domcontentloaded');
  const approve = await txPopup.waitForSelector('[data-testid="confirm-footer-button"]');
  approve.click();

  await page.click('summary');
  await page.click('button:has-text("Disconnect")');

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
  await page.close();
}

// export const arch = () => {
//   const page = await context.newPage();
//   page.goto("https://testnet.roverstaking.com/stake");
//   await page.waitForLoadState('domcontentloaded');
// }

