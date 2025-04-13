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

const steps = async (seed: string[], password: string) => {
  const { context, page } = await loadExtension();
  await createWallet(page, seed, password);
  await addAndSwitchToTestnetNetwork(page, rise);
  
  for (let i = 1; i <= 2; i++) {
    await selectAccount(page, `Account ${i}`);
    await page.waitForTimeout(3000);

    await gaspump(context, 0.00003, 0.00005);
    await clober(context, 0.00002, 0.00007);
  }
}

const run = async () => {

  await Promise.all([
    steps(seed, password)
  ]);
};

run().catch(console.error);
