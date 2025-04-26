import { BrowserContext, Page } from "playwright";

export const selectAccount = async (page: Page, accountName: string): Promise<void> => {
  const accountPicker = page.locator('[data-testid="account-menu-icon"]');
  accountPicker.click();

  await page
    .locator('button.mm-box.mm-text.multichain-account-list-item__account-name__button')
    .filter({ hasText: new RegExp(`^${accountName}$`) })
    .click();

  await page.waitForTimeout(1000);
}

export const connectWallet = async (context: BrowserContext): Promise<void> => {
  const connectPopup = await context.waitForEvent('page');

  await connectPopup.waitForLoadState('domcontentloaded');
  await connectPopup.locator('[data-testid="confirm-btn"]').click();
  await connectPopup.waitForEvent('close');
}

export const confirmTx = async (context: BrowserContext): Promise<void> => {
  const txPopup = await context.waitForEvent('page');

  await txPopup.waitForLoadState('domcontentloaded');
  const approve = await txPopup.waitForSelector('[data-testid="confirm-footer-button"]');
  approve.click();

  await txPopup.waitForEvent('close');
}

export const clearActivity = async (context: BrowserContext, page: Page): Promise<void> => {
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear();
    indexedDB.databases().then((dbs: IDBDatabaseInfo[]) => dbs.forEach(db => indexedDB.deleteDatabase(db.name)));
    caches.keys().then((names) => names.forEach(name => caches.delete(name)));
  });
  await context.clearCookies();
  await context.clearPermissions();
}
