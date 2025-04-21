import { Network } from "./types";
import { clober, gaspump, inarifi } from "./utils/rise-protocols";
import { disconnectAccountFromApps, login, switchAccount } from "./utils/metamask";

const seed = ["stomach", "focus", "ostrich", "thank", "hundred", "fuel", "flower", "boss", "sure", "boy", "riot", "figure"];
const password = "!Stolica34!";

const botanix: Network = {
  name: "Botanix Testnet",
  rpcUrl: "https://node.botanixlabs.dev",
  chainId: 3636,
  symbol: "BTC"
}

const rise: Network = {
  name: "RISE Testnet",
  rpcUrl: "https://testnet.riselabs.xyz",
  chainId: 11155931,
  symbol: "ETH"
}

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await login(password);

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `Account ${i}`;
    
    await switchAccount(page, account);
    await clober(context, account, 0.00003, 0.00005);
    await disconnectAccountFromApps(context, account);
  }

  await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 7, 20)
  ]);
};

run().catch(console.error);
