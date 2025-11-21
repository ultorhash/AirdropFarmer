import { BrowserContext } from "playwright";
import { Logger } from "../utils/logger";
import { faker } from "@faker-js/faker";
import { Rabby } from "../utils/rabby";

export const deployra = async (
  context: BrowserContext,
  account: string,
  chain: string
): Promise<void> => {
  const page = await context.newPage();
  page.goto("https://app.deployra.xyz/");
  await page.waitForLoadState('domcontentloaded');

  try {
    await page.locator('input[placeholder="Search by name or ID..."]').fill(chain);

    const options = ["Message", "Token", "GM"];
    const randomOption = options[Math.floor(Math.random() * options.length)];

    if (randomOption === "Token") {
      await page.locator('[data-testid="Token"]').click();

      const word = faker.word.sample();
      const acronymLength = faker.number.int({ min: 2, max: 3 });
      const acronym = word.substring(0, acronymLength).toUpperCase();

      await page.waitForTimeout(1000);

      await page.locator('input[placeholder="Name"]').fill(word);
      await page.locator('input[placeholder="Symbol"]').fill(acronym);

      await page.locator('button[type="submit"]').click();
      await Rabby.confirmTxAsync(context);
      Logger.ok(account, `${chain} deploy token [${word} | ${acronym}]`);

    } else {
      await page.locator('button[type="submit"]').click();
      await Rabby.confirmTxAsync(context);
      Logger.ok(account, `${chain} deploy ${randomOption}`);
    }

  } catch (err: unknown) {
    console.log(err)
    Logger.error(account, `${chain} deploy`);
  } finally {
    await page.close();
  }
}
