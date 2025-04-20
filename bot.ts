import { Network } from "./types";
import { clober, gaspump, inarifi } from "./utils/rise-protocols";
import { disconnectAccountFromApps, loadAndSelectAccount } from "./utils/metamask";

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
  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `Account ${i}`;
    const context = await loadAndSelectAccount(password, account);

    await disconnectAccountFromApps(context, account);
    //await gaspump(context, account, 0.00005, 0.00008);
    await clober(context, account, 0.00004, 0.00007);

    await context.close();
  }
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 18, 19)
  ]);
};

run().catch(console.error);
