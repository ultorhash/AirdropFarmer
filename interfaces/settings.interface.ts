import { BrowserContext } from "playwright";

export interface ISettings {
  walletPassword: string;
  accountRange: {
    from: number;
    to: number;
  }
  profiles: {
    brave?: number;
    edge?: string;
  }
  dappsToVisit: number;
  dapps: ((ctx: BrowserContext, acc: string) => Promise<void>)[];
}
