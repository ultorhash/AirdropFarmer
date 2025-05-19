import { BrowserContext, Page, chromium } from "playwright";

let scrollUp: boolean = true;

export const rabbyLogin = async (profile: number, password: string): Promise<{ context: BrowserContext, page: Page }> => {
  const bravePath = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
  const userDataDir = "C:\\Users\\rajsk\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data";

  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: bravePath,
    ignoreDefaultArgs: true,
    args: [
      `--profile-directory=Profile ${profile}`,
      '--remote-debugging-pipe'
    ]
  });

  const [page] = context.pages();
  await page.goto('chrome-extension://acmacodkjbdgmoleebolmdjonilkdbch/index.html#');
  await page.locator('input[type="password"]').fill(password);
  await page.locator('span:has-text("Unlock")').click();

  return { context, page };
}

export const rabbyLoginEdge = async (profile: number, password: string): Promise<{ context: BrowserContext, page: Page }> => {
  const bravePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\.msedge.exe";
  const userDataDir = "C:\\Users\\rajsk\\AppData\\Local\\Microsoft\\Edge\\User Data";

  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: bravePath,
    ignoreDefaultArgs: true,
    args: [
      `--profile-directory=Profile ${profile}`,
      '--remote-debugging-pipe'
    ]
  });

  const [page] = context.pages();
  await page.goto('chrome-extension://acmacodkjbdgmoleebolmdjonilkdbch/index.html#');
  await page.locator('input[type="password"]').fill(password);
  await page.locator('span:has-text("Unlock")').click();

  return { context, page };
}

export const rabbySwitchAccount = async (page: Page, account: string): Promise<void> => {
  await page.locator('div.current-address').click();

  if (scrollUp) {
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('.address-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    });

    scrollUp = false;
  }

  await page
    .locator('div.address-group-list.management div.rabby-address-item-alias')
    .filter({ hasText: new RegExp(`^Seed Phrase 1 ${account}$`) })
    .click();
}

export const rabbyConnect = async (context: BrowserContext): Promise<void> => {
  const popup = await context.waitForEvent('page');
  await popup.waitForLoadState('domcontentloaded');

  await popup.locator('button:has-text("Connect")').click();
  await popup.waitForEvent('close');
}

export const rabbyConfirmTx = async (context: BrowserContext): Promise<void> => {
  const popup = await context.waitForEvent('page');
  await popup.waitForLoadState('domcontentloaded');

  await popup.locator('button:has-text("Sign")').click();
  await popup.locator('button:has-text("Confirm")').click();
  await popup.waitForEvent('close');
}
