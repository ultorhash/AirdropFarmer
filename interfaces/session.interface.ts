import { BrowserContext, Page } from "playwright";

export interface ISession {
  context: BrowserContext;
  page: Page;
}
