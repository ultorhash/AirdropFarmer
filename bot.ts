import { BrowserContext, Page } from "playwright";
import { arch, bitzy, rover } from "./chains/botanix";
import { onchaingm } from "./chains/common";
import { comfy } from "./chains/inco";
import { dailyCheckIn, mintair, zenith } from "./chains/pharos";
import { b3x, clober, gaspump, inarifi, nft } from "./chains/rise";
import { Action } from "./enums";
import { rabbyLoginBrave, rabbyLoginEdge, rabbySwitchAccount } from "./utils/wallets";
import _ from "lodash";
import { Session } from "./interfaces";
import { Profile } from "./types";

const BRAVE_AUTOMATED_1 = 5;
const BRAVE_AUTOMATED_2 = 9;
const BRAVE_AUTOMATED_3 = 10;
const BRAVE_AUTOMATED_PATRYK = 11;

const EDGE_AUTOMATED_1 = "Default";
const EDGE_AUTOMATED_2 = "Profile 1";
const EDGE_AUTOMATED_3 = "Profile 2";

const settings = {
  password: "!Stolica34!",
  profiles: {
    brave: BRAVE_AUTOMATED_1,
    edge: EDGE_AUTOMATED_1
  },
  dappsAmount: 2,
  fromAccount: 28,
  toAccount: 100
}

const riseDapps = [
  (ctx: BrowserContext, acc: string) => gaspump(ctx, acc, 0.00003, 0.00006, Action.SWAP, "WETH/USDC"),
  (ctx: BrowserContext, acc: string) => clober(ctx, acc, 0.00002, 0.00005, Action.SWAP, true),
  (ctx: BrowserContext, acc: string) => inarifi(ctx, acc, 0.00002, 0.00005)
];

const pharosDapps = [
  (ctx: BrowserContext, acc: string) => mintair(ctx, acc),
  (ctx: BrowserContext, acc: string) => zenith(ctx, acc, 0.0015, 0.004, false),
  //(ctx: BrowserContext, acc: string) => dailyCheckIn(ctx, acc, 2, 10),
  (ctx: BrowserContext, acc: string) => onchaingm(ctx, acc, 1, 2, "Pharos", 688688, true)
];

const runProfile = async (
  getSession: () => Promise<Session>,
  dapps: ((context: BrowserContext, account: string) => Promise<void>)[],
  dappsAmount: number,
  fromAccount: number,
  toAccount: number
): Promise<void> => {
  const { context, page } = await getSession();

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `#${i}`;
    await rabbySwitchAccount(page, account);
    const drawnDapps = _.sampleSize(dapps, dappsAmount);

    for (const dapp of drawnDapps) {
      await dapp(context, account);
    }
  }

  await context.close();
};

const bot = async (): Promise<void> => {
  const { password, profiles, dappsAmount, fromAccount, toAccount } = settings;
  const { brave, edge } = profiles;

  await Promise.all([
    runProfile(() => rabbyLoginBrave(brave, password), pharosDapps, dappsAmount, fromAccount, toAccount),
    //runProfile(rabbyLoginEdge, edge, password, riseDapps, dappsAmount, fromAccount, toAccount)
  ]);
}

bot().catch(console.error);
