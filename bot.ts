import { b3x, clober, gaspump, inarifi, onchaingm } from "./chains/rise";
import { Action } from "./enums";
import { rabbyLogin, rabbySwitchAccount } from "./utils/wallets";
import _ from "lodash";

const password = "!Stolica34!";

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await rabbyLogin(password);

  const dapps = [
    (account: string) => gaspump(context, account, 0.00004, 0.00008, Action.LIQUIDITY, "USDT/PEPE"),
    //(account: string) => clober(context, account, 0.00002, 0.00005, Action.WRAP),
    //(account: string) => inarifi(context, account, 0.00002, 0.00004),
    //(account: string) => onchaingm(context, account, 2, 5, false)
  ];

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `#${i}`;
    await rabbySwitchAccount(page, account);
    const randomDapp = _.sample(dapps);
    await randomDapp(account);
  }

  await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 3, 3)
  ]);
};

run().catch(console.error);
