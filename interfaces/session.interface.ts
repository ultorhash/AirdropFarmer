import { BrowserContext, Page } from "playwright";

export interface Session {
  context: BrowserContext;
  page: Page;
}
