import { loadExtension } from "./utils/setup";
import { createWallet, addAndSwitchToTestnetNetwork, selectAccount } from "./utils/metamask";
import { Network } from "./types";
import { clober, gaspump, inarifi } from "./utils/rise-protocols";

const seed = ["stomach", "focus", "ostrich", "thank", "hundred", "fuel", "flower", "boss", "sure", "boy", "riot", "figure"];
const password = "Test123#bwGv23%!";

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

const steps = async (seed: string[], password: string, startIndex: number, endIndex: number): Promise<void> => {
  for (let i = startIndex; i <= endIndex; i++) {
    const account = `Account ${i}`;
    const { context, page } = await loadExtension(true);

    await createWallet(page, seed, password);
    await addAndSwitchToTestnetNetwork(page, rise);
    await selectAccount(page, account);

    await gaspump(context, account, 0.00005, 0.00008);

    context.close();
  }
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(seed, password, 11, 20)
  ]);
};

run().catch(console.error);
