import { b3x, clober, gaspump, inarifi, onchaingm } from "./chains/rise";
import { Action } from "./enums";
import { rabbyLogin, rabbySwitchAccount } from "./utils/wallets";

const password = "!Stolica34!";

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await rabbyLogin(password);

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `#${i}`;
    
    await rabbySwitchAccount(page, account);
    await gaspump(context, account, 0.00004, 0.00008);
    //await clober(context, account, 0.00002, 0.00005, Action.UNWRAP);
    //await inarifi(context, account, 0.00001, 0.00004);
    //await onchaingm(context, account, 2, 5);
  }

  await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 1, 10)
  ]);
};

run().catch(console.error);
