import * as dotenv from "dotenv";
import { ISettings, ISession } from "./interfaces";
import { deployra } from "./chains/common";
import { IOPn } from "./chains/iopn";
import { Rabby } from "./utils/rabby";
import _ from "lodash";

dotenv.config({ quiet: true });

const EDGE_AUTOMATED_1 = "Default";

const settings: ISettings = {
  password: process.env.PASSWORD,
  profiles: { edge: EDGE_AUTOMATED_1 },
  range: { from: 1, to: 100 },
  dappsToVisit: 2,
  dapps: [
    (ctx, acc) => IOPn.swap(ctx, acc, 0.005, 0.02, true),
    (ctx, acc) => IOPn.swap(ctx, acc, 0.008, 0.02, true),
    (ctx, acc) => IOPn.liquidity(ctx, acc),
    (ctx, acc) => deployra(ctx, acc, "IOPn")
  ],
  clearPendingTxs: false
}

const runProfileAsync = async (getSession: () => Promise<ISession>, settings: ISettings): Promise<void> => {
  const { context, page } = await getSession();
  const { dapps, dappsToVisit, range: { from, to }, clearPendingTxs } = settings;

  for (let i = from; i <= to; i++) {
    const account = `#${i}`;
    await Rabby.switchAccountAsync(page, account);

    if (clearPendingTxs) {
      await Rabby.clearPendingTxsAsync(page, account);
    }

    const drawnDapps = _.sampleSize(dapps, dappsToVisit);

    for (const dapp of drawnDapps) {
      await dapp(context, account);
    }
  }

  await context.close();
};

const bot = async (): Promise<void> => {
  const { password, profiles } = settings;
  const { brave, edge } = profiles;

  await Promise.all(
    [
      brave && runProfileAsync(() => Rabby.loginBraveAsync(brave, password), settings),
      edge && runProfileAsync(() => Rabby.loginEdgeAsync(edge, password), settings)
    ].filter(Boolean)
  );
}

bot().catch(console.error);
