import { Page } from "playwright";
import { Network } from "../types";

export const createWallet = async (
  page: Page,
  seed: string[],
  password: string
): Promise<void> => {
  const checkbox = await page.waitForSelector('[data-testid="onboarding-terms-checkbox"]');
  checkbox.click();

  page.locator('[data-testid="onboarding-import-wallet"]').click();
  page.locator('[data-testid="metametrics-no-thanks"]').click();

  for (let i = 0; i < seed.length; i++) {
    const selector = `[data-testid="import-srp__srp-word-${i}"]`;
    await page.locator(selector).fill(seed[i]);
  }

  page.locator('[data-testid="import-srp-confirm"]').click();

  const newPasswordInput = page.locator('[data-testid="create-password-new"]');
  const confirmPasswordInput = page.locator('[data-testid="create-password-confirm"]');

  await newPasswordInput.fill(password);
  await confirmPasswordInput.fill(password);

  page.locator('[data-testid="create-password-terms"]').click();
  page.locator('[data-testid="create-password-import"]').click();
  page.locator('[data-testid="onboarding-complete-done"]').click();

  page.locator('[data-testid="pin-extension-next"]').click();
  page.locator('[data-testid="pin-extension-done"]').click();
}

export const switchToTestnetNetwork = async (page: Page, name: string): Promise<void> => {
  page.locator('[data-testid="network-display"]').click();
  const div = page.locator('.multichain-network-list-menu');

  const box = await div.boundingBox();
  await page.mouse.wheel(0, box.height);

  const toggle = page.locator('input[type="checkbox"]');
  await toggle.check({ force: true });

  const testnetNetworks = page.locator(`[data-testid="${name}"]`);
  testnetNetworks.click();
}

export const addAndSwitchToTestnetNetwork = async (page: Page, network: Network): Promise<void> => {
  page.locator('[data-testid="network-display"]').click();
  page.locator('text="Add a custom network"').click();

  const networkName = page.locator('[data-testid="network-form-network-name"]');

  await networkName.fill(network.name);

  page.locator('[data-testid="test-add-rpc-drop-down"]').click();
  page.locator('text="Add RPC URL"').click();

  const rpcUrl = page.locator('[data-testid="rpc-url-input-test"]');
  await rpcUrl.fill(network.rpcUrl);
  
  page.locator('text="Add URL"').click();

  const chainId = page.locator('[data-testid="network-form-chain-id"]');
  await chainId.fill(network.chainId.toString());

  const symbol = page.locator('[data-testid="network-form-ticker-input"]');
  await symbol.fill(network.symbol);

  await page.locator('.networks-tab__network-form__footer button').click();

  page.locator('[data-testid="network-display"]').click();
  const enabledNetworks = page.locator(`[data-testid="${network.name}"]`);

  await enabledNetworks.click();
}

export const selectAccount = async (page: Page, accountName: string): Promise<void> => {
  const accountPicker = page.locator('[data-testid="account-menu-icon"]');
  accountPicker.click();
  const account = page.locator(`button.mm-box.mm-text.multichain-account-list-item__account-name__button:has-text("${accountName}")`);
  account.click();
}
