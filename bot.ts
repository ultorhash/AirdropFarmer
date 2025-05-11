import { b3x, clober, gaspump, inarifi, onchaingm } from "./chains/rise";
import { Action } from "./enums";
import { rabbyLogin, rabbySwitchAccount } from "./utils/wallets";
import _ from "lodash";

const AUTOMATED_1 = 5;
const AUTOMATED_2 = 9;

const settings = {
  password: "!Stolica34!",
  profile: AUTOMATED_2,
  dappsAmount: 2,
  fromAccount: 13,
  toAccount: 50
}

const bot = async (): Promise<void> => {
  const { password, profile, dappsAmount, fromAccount, toAccount } = settings;
  const { context, page } = await rabbyLogin(profile, password);

  const dapps = [
    (account: string) => gaspump(context, account, 0.00004, 0.00008, Action.SWAP, "USDT/PEPE"),
    (account: string) => clober(context, account, 0.00002, 0.00005, Action.WRAP),
    //(account: string) => inarifi(context, account, 0.00002, 0.00004),
    //(account: string) => onchaingm(context, account, 2, 5, true)
  ];

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `#${i}`;
    await rabbySwitchAccount(page, account, i === 1);
    const drawnDapps = _.sampleSize(dapps, dappsAmount);

    for (const dapp of drawnDapps) {
      await dapp(account);
    }
  }

  await context.close();
}

bot().catch(console.error);
