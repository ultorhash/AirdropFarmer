import { BrowserContext, Page } from "playwright";
import { rabbyClearPendingTxs, rabbyLoginBrave, rabbyLoginEdge, rabbySwitchAccount } from "./utils/wallets";
import * as dotenv from "dotenv";
import { ISettings, ISession } from "./interfaces";
import _ from "lodash";
import { deployra } from "./chains/common";
import { IOPn } from "./chains/iopn";

dotenv.config({ quiet: true });

const EDGE_AUTOMATED_1 = "Default";

const settings: ISettings = {
  walletPassword: process.env.WALLET_PASSWORD,
  accountRange: {
    from: 1,
    to: 100
  },
  profiles: {
    edge: EDGE_AUTOMATED_1
  },
  dappsToVisit: 1,
  dapps: [
    (ctx, acc) => IOPn.swap(ctx, acc, 0.001, 0.005)
  ]
}

const runProfile = async (
  getSession: () => Promise<ISession>,
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
  const { walletPassword, accountRange, profiles, dappsToVisit, dapps } = settings;
  const { from, to } = accountRange;
  const { brave, edge } = profiles;

  await Promise.all(
    [
      brave && runProfile(() => rabbyLoginBrave(brave, walletPassword), dapps, dappsToVisit, from, to),
      edge && runProfile(() => rabbyLoginEdge(edge, walletPassword), dapps, dappsToVisit, from, to)
    ].filter(Boolean)
  );
}

bot().catch(console.error);
