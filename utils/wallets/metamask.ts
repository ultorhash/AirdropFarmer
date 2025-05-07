import { BrowserContext, chromium, Page } from "playwright";

export const metamaskLogin = async (password: string): Promise<{ context: BrowserContext, page: Page }> => {
  const bravePath = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
  const userDataDir = "C:\\Users\\rajsk\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data";

  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: bravePath,
    ignoreDefaultArgs: true,
    args: [
      '--profile-directory=Profile 5',
      '--remote-debugging-pipe'
    ]
  });

  const [page] = context.pages();
  await page.goto('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#');
  await page.locator('[data-testid="unlock-password"]').fill(password); 
  await page.locator('[data-testid="unlock-submit"]').click();

  return { context, page };
}

export const metamaskSwitchAccount = async (page: Page, account: string): Promise<void> => {
  await page.locator('[data-testid="account-menu-icon"]').click();
  await page
    .locator('button.mm-box.mm-text.multichain-account-list-item__account-name__button')
    .filter({ hasText: new RegExp(`^${account}$`) })
    .click();
  await page.waitForTimeout(500);
}

export const disconnectAccountFromApps = async (context: BrowserContext, account: string): Promise<void> => {
  const [page] = context.pages();

  await page.locator('[data-testid="account-options-menu-button"]').click();
  await page.waitForTimeout(300);
  await page.locator('[data-testid="global-menu-connected-sites"]').click();
  await page.waitForTimeout(300);

  while (await page.locator('[data-testid="connection-list-item"]').count() > 0) {
    await page.locator('[data-testid="connection-list-item"]').first().click();
    await page.locator('[data-test-id="disconnect-all"]').click();
    await page.locator('[data-testid="disconnect-all"]').click();
    await page.waitForTimeout(500);
    await page.click('span[style*="arrow-left.svg"]');
  }

  const hasDisconnected = await page
    .locator('[data-testid="no-connections"] p')
    .locator('text=Nothing to see here')
    .isVisible();

  if (!hasDisconnected) {
    throw new Error(`${account} has not been disconnected from all apps!`);
  }

  await page.click('span[style*="arrow-left.svg"]');
  await page.waitForTimeout(1000);
}
