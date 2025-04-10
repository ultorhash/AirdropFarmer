import { loadExtension } from "./utils/setup";
import { createWallet, addAndSwitchToTestnetNetwork, switchToTestnetNetwork } from "./utils/metamask";
import { rover } from "./utils/botanix-protocols";
import { Network } from "./types";

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
  await switchToTestnetNetwork(page, "Mega Testnet");

  //await addAndSwitchToTestnetNetwork(page, network);

  // protocols
  //await rover(context);
}

main();
