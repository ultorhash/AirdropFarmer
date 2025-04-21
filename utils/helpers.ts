import { BrowserContext, Page } from "playwright";

export const clearActivity = async (context: BrowserContext, page: Page) => {
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear();
    indexedDB.databases().then((dbs: IDBDatabaseInfo[]) => dbs.forEach(db => indexedDB.deleteDatabase(db.name)));
    caches.keys().then((names) => names.forEach(name => caches.delete(name)));
  });
  await context.clearCookies();
  await context.clearPermissions();
}
