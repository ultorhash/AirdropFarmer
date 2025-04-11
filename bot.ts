import { loadExtension } from "./utils/setup";
import { createWallet, switchToTestnetNetwork, addAndSwitchToTestnetNetwork, selectAccount } from "./utils/metamask";
import { Network } from "./types";
import { bebop, gte } from "./utils/megaeth-protocols";
import { rover } from "./utils/botanix-protocols";

const seed = ["stomach", "focus", "ostrich", "thank", "hundred", "fuel", "flower", "boss", "sure", "boy", "riot", "figure"];
const password = "Test123#bwGv23%!";

const network: Network = {
  name: "Botanix Testnet",
  rpcUrl: "https://node.botanixlabs.dev",
  chainId: 3636,
  symbol: "BTC"
}

const main = async () => {
  const { context, page } = await loadExtension();
  await createWallet(page, seed, password);
  //await switchToTestnetNetwork(page, "Mega Testnet");
  await addAndSwitchToTestnetNetwork(page, network);

  for (let i = 1; i <= 1; i++) {
    await selectAccount(page, `Account ${i}`);
    await page.waitForTimeout(1500);

    await rover(context);
  }
}

main();
