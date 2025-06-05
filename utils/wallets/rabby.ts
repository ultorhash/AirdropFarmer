import { BrowserContext, Page, chromium } from "playwright";
import { Session } from "../../interfaces";

let scrollUp: boolean = true;

export const rabbyLoginBrave = async (profile: number, password: string): Promise<Session> => {
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

export const rabbyLoginEdge = async (profile: string, password: string): Promise<Session> => {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const userDataDir = "C:\\Users\\rajsk\\AppData\\Local\\Microsoft\\Edge\\User Data";

  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: edgePath,
    ignoreDefaultArgs: true,
    args: [
      `--profile-directory=${profile}`,
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

export const rabbyConfirmTx = async (context: BrowserContext): Promise<void> => {
  const popup = await context.waitForEvent('page');

  try {
    await Promise.race([
      (async () => {
        await popup.waitForLoadState('domcontentloaded');
        await popup.locator('button:has-text("Sign")').click();
        await popup.locator('button:has-text("Confirm")').click();
        await popup.waitForEvent('close');
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Rabby tx took too long')), 20_000)
      )
    ]);
  } catch (err: unknown) {
    if (!popup.isClosed()) {
      try {
        await popup.close();
      } catch {}
    }
    throw new Error("Rabby tx confirmation error!");
  }
}

export const rabbyConnect = async (context: BrowserContext, ignoreAll: boolean): Promise<void> => {
  const popup = await context.waitForEvent('page');

  try {
    await Promise.race([
      (async () => {
        await popup.waitForLoadState('domcontentloaded');
        
        if (ignoreAll) {
          await popup.locator('span:has-text("Ignore all")').click();
        }

        await popup.locator('button:has-text("Connect")').click();
        await popup.waitForEvent('close');
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Rabby connect took too long')), 12_000)
      )
    ]);
  } catch (err: unknown) {
    if (!popup.isClosed()) {
      try {
        await popup.close();
      } catch {}
    }
    throw new Error("Rabby tx confirmation error!");
  }
}
