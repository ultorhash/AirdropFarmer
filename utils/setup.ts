import { BrowserContext, chromium, Page } from "playwright";

export const loadExtension = async (): Promise<{ context: BrowserContext, page: Page }> => {
  const bravePath = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
  const metaMaskExtensionPath = "C:\\Users\\rajsk\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Profile 5\\Extensions\\nkbihfbeogaeaoehlefnkodbefgpgknn\\12.15.2_0";

  const browserContext = await chromium.launchPersistentContext('', {
    executablePath: bravePath,
    headless: false,
    args: [
      `--disable-extensions-except=${metaMaskExtensionPath}`,
      `--load-extension=${metaMaskExtensionPath}`
    ]
  });

  await browserContext.waitForEvent('page');
  const [defaultPage, metamaskPage] = browserContext.pages();
  defaultPage.close();

  return {
    context: browserContext,
    page: metamaskPage
  };
}
