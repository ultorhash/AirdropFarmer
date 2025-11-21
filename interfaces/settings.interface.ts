import { BrowserContext } from "playwright";

export interface ISettings {
  password: string;
  profiles: {
    brave?: number;
    edge?: string;
  }
  range: {
    from: number;
    to: number;
  }
  dappsToVisit: number;
  dapps: ((ctx: BrowserContext, acc: string) => Promise<void>)[];
  clearPendingTxs: boolean;
}
