import { BrowserContext, Page } from "playwright";
import { rabbyClearPendingTxs, rabbyLoginBrave, rabbyLoginEdge, rabbySwitchAccount } from "./utils/wallets";
import { iopnSwap } from "./chains/iop";
import { Session } from "./interfaces";
import _ from "lodash";
import { deployra } from "./chains/common";

const EDGE_AUTOMATED_1 = "Default";

const settings = {
  password: "!Stolica34!",
  profiles: {
    brave: 0,
    edge: EDGE_AUTOMATED_1
  },
  dappsAmount: 1,
  fromAccount: 1,
  toAccount: 10
}

const iopnDapps = [
  //(ctx: BrowserContext, acc: string) => iopnSwap(ctx, acc, 0.001, 0.003),
  (ctx: BrowserContext, acc: string) => deployra(ctx, acc, "IOPn")
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
    //await rabbyClearPendingTxs(page, account);
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
    //runProfile(() => rabbyLoginBrave(brave, password), iopDapps, dappsAmount, fromAccount, toAccount),
    runProfile(() => rabbyLoginEdge(edge, password), iopnDapps, dappsAmount, fromAccount, toAccount)
  ]);
}

bot().catch(console.error);
