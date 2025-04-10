import { loadExtension, createWallet, addAndEnableNetwork } from "./utils";
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
  const page = await loadExtension();
  await createWallet(page, seed, password);
  await addAndEnableNetwork(page, network);
}

main();
