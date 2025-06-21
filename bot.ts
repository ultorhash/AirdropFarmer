import { BrowserContext, Page } from "playwright";
import { mintair, onchaingm } from "./chains/common";
import { dailyCheckIn, faroswap, getPharosBalance, gotchipus, infiexchange, sendToFriend, turing, zenith } from "./chains/pharos";
import { b3x, clober, gaspump, inarifi } from "./chains/rise";
import { Action } from "./enums";
import { rabbyLoginBrave, rabbyLoginEdge, rabbySwitchAccount } from "./utils/wallets";
import { Session } from "./interfaces";
import _ from "lodash";
import { heliosStake } from "./chains/helios";

const BRAVE_AUTOMATED_1 = 5;
const BRAVE_AUTOMATED_2 = 9;
const BRAVE_AUTOMATED_3 = 10;
const BRAVE_AUTOMATED_PATRYK = 11;

const EDGE_AUTOMATED_1 = "Default";
const EDGE_AUTOMATED_2 = "Profile 1";
const EDGE_AUTOMATED_3 = "Profile 5";
const EDGE_AUTOMATED_PATRYK = "Profile 2";

const settings = {
  password: "!Stolica34!",
  profiles: {
    brave: BRAVE_AUTOMATED_3,
    edge: EDGE_AUTOMATED_3
  },
  dappsAmount: 1,
  fromAccount: 1,
  toAccount: 2
}

const riseDapps = [
  (ctx: BrowserContext, acc: string) => gaspump(ctx, acc, 0.00003, 0.00006, Action.SWAP, "WETH/USDC"),
  //(ctx: BrowserContext, acc: string) => gaspump(ctx, acc, 0.00003, 0.00006, Action.SWAP, "WETH/USDC"),
  (ctx: BrowserContext, acc: string) => clober(ctx, acc, 0.00002, 0.00005, Action.UNWRAP, true),
  //(ctx: BrowserContext, acc: string) => inarifi(ctx, acc, 0.00002, 0.00005)
  //(ctx: BrowserContext, acc: string) => b3x(ctx, acc, 0.001, 0.003),
];

const pharosDapps = [
  //(ctx: BrowserContext, acc: string) => zenith(ctx, acc, 0.0003, 0.0007, Action.SWAP),
  //(ctx: BrowserContext, acc: string) => mintair(ctx, acc),
  //(ctx: BrowserContext, acc: string) => gotchipus(ctx, acc),
  //(ctx: BrowserContext, acc: string) => sendToFriend(ctx, acc, 0.00002, 0.00007, false),
  (ctx: BrowserContext, acc: string) => dailyCheckIn(ctx, acc, true)
];

const heliosDapps = [
  (ctx: BrowserContext, acc: string) => heliosStake(ctx, acc, 0.001, 0.005)
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

    // const address = await getAddress(page);
    // await getPharosBalance(context, account, address, 0.01);
  }

  await context.close();
};

const bot = async (): Promise<void> => {
  const { password, profiles, dappsAmount, fromAccount, toAccount } = settings;
  const { brave, edge } = profiles;

  await Promise.all([
    runProfile(() => rabbyLoginBrave(brave, password), pharosDapps, dappsAmount, fromAccount, toAccount),
    runProfile(() => rabbyLoginEdge(edge, password), pharosDapps, dappsAmount, fromAccount, toAccount)
  ]);
}

bot().catch(console.error);
