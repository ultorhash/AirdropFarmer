import { b3x, clober, gaspump, inarifi } from "./chains/rise";
import { Action } from "./enums";
import { metamaskLogin, metamaskSwitchAccount, rabbyLogin, rabbySwitchAccount } from "./utils/wallets";

const password = "!Stolica34!";

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await rabbyLogin(password);

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `#${i}`;
    
    await rabbySwitchAccount(page, account);
    await clober(context, account, 0.00005, 0.00008, Action.WRAP);
  }

  await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 3, 50)
  ]);
};

run().catch(console.error);
