import { BrowserContext, chromium, Page } from "playwright";

export const loadExtension = async (headless: boolean): Promise<{ context: BrowserContext, page: Page }> => {
  const bravePath = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
  const metaMaskExtensionPath = "C:\\Users\\rajsk\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Profile 5\\Extensions\\nkbihfbeogaeaoehlefnkodbefgpgknn\\12.16.0_0";

  const browserContext = await chromium.launchPersistentContext('', {
    executablePath: bravePath,
    headless: headless,
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

export const loadRabby = async (seed: string[], password: string) => {
  const bravePath = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
  const rabbyPath = "C:\\Users\\rajsk\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Profile 5\\Extensions\\acmacodkjbdgmoleebolmdjonilkdbch\\0.93.26_0";

  const browser = await chromium.launchPersistentContext('', {
    executablePath: bravePath,
    headless: false,
    args: [
      `--disable-extensions-except=${rabbyPath}`,
      `--load-extension=${rabbyPath}`
    ]
  });

  await browser.waitForEvent('page');
  const [_, page] = browser.pages();
  _.close();

  await page.locator('button:has-text("I already have an address")').click();
  await page.locator('div:text("Seed Phrase")').first().click();
  const inputs = page.locator('input.ant-input.mnemonics-input');
  
  for (let i = 0; i < seed.length; i++) {
    await inputs.nth(i).fill(seed[i]);
  }

  await page.waitForTimeout(300);
  await page.locator('button[type="submit"]').click();

  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.locator('button:has-text("Confirm")').click();

  await page.waitForTimeout(2000);
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
    `
  });

  const toggle = page.locator('button.ant-switch.AddToRabby');
  const count = await toggle.count();

  for (let i = 1; i < 10; i++) { ///////////
    await toggle.nth(i).click();
  }

  await page.locator('button:has-text("Import")').click();
  return { context: browser };
}
