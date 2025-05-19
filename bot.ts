import { arch, bitzy, rover } from "./chains/botanix";
import { onchaingm } from "./chains/common";
import { comfy } from "./chains/inco";
import { dailyCheckIn, mintair, zenith } from "./chains/pharos";
import { b3x, clober, gaspump, inarifi, nft } from "./chains/rise";
import { Action } from "./enums";
import { rabbyLogin, rabbyLoginEdge, rabbySwitchAccount } from "./utils/wallets";
import _ from "lodash";

const AUTOMATED_1 = 5;
const AUTOMATED_2 = 9;
const AUTOMATED_3 = 10;
const AUTOMATED_PATRYK = 11;

const settings = {
  password: "!Stolica34!",
  profile: AUTOMATED_1,
  dappsAmount: 1,
  fromAccount: 11,
  toAccount: 100
}

const bot = async (): Promise<void> => {
  const { password, profile, dappsAmount, fromAccount, toAccount } = settings;
  const { context, page } = await rabbyLogin(profile, password);

  const dapps = [
    //(account: string) => gaspump(context, account, 0.00003, 0.00006, Action.SWAP, "WETH/USDC"),
    (account: string) => clober(context, account, 0.00002, 0.00005, Action.SWAP, true),
    //(account: string) => inarifi(context, account, 0.00002, 0.00005),
    //(account: string) => onchaingm(context, account, 1, 2, "Pharos", 688688, false),
    //(account: string) => nft(context, account)
    //(account: string) => comfy(context, account)
    //(account: string) => arch(context, account, 0.00001, 0.00004),
    //(account: string) => rover(context, account, 0.00001, 0.00004)
    //(account: string) => bitzy(context, account, 0.00001, 0.00003),
    //(account: string) => mintair(context, account),
    //(account: string) => zenith(context, account, 0.0015, 0.004, false)
    //(account: string) => dailyCheckIn(context, account, 2, 10)
  ];

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `#${i}`;
    await rabbySwitchAccount(page, account);
    const drawnDapps = _.sampleSize(dapps, dappsAmount);

    for (const dapp of drawnDapps) {
      await dapp(account);
    }
  }

  await context.close();
}

bot().catch(console.error);
