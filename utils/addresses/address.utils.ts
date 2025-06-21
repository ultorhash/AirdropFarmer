import { Page } from "playwright";

export const getAddress = async (page: Page): Promise<string> => {
  await page.waitForTimeout(2000);
  await page.locator('svg.copyAddr').click();

  const copiedText = await page.evaluate(() => {
    return navigator.clipboard.readText();
  });

  await page.waitForTimeout(1000);
  return copiedText;
};


export const shuffleAddresses = (array: string[]): string[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export const randomizeAddresses = (pairs: Map<string, string>): Record<string, string> => {
  const keys = Array.from(pairs.keys());
  const values = Array.from(pairs.values());

  const shuffledValues = shuffleAddresses(values.slice());

  const result: Record<string, string> = {};
  keys.forEach((key, index) => {
    result[key] = shuffledValues[index];
  });

  return result;
}

export const createTransferPairs = (addresses: string[]): Map<string, string> => {
  const shuffled = shuffleAddresses(addresses);
  const pairs = new Map<string, string>();

  for (let i = 0; i < shuffled.length; i++) {
    const from = shuffled[i];
    const to = shuffled[(i + 1) % shuffled.length];
    pairs.set(from, to);
  }

  return pairs;
}
