import { b3x, clober, gaspump, inarifi, onchaingm } from "./chains/rise";
import { Action } from "./enums";
import { metamaskLogin, metamaskSwitchAccount, rabbyLogin, rabbySwitchAccount } from "./utils/wallets";

const password = "!Stolica34!";

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await rabbyLogin(password);

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `#${i}`;
    
    await rabbySwitchAccount(page, account);
    //await clober(context, account, 0.00002, 0.00005, Action.WRAP);
    //await inarifi(context, account, 0.00001, 0.00004);
    await onchaingm(context, account);
  }

  await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 7, 7)
  ]);
};

run().catch(console.error);
