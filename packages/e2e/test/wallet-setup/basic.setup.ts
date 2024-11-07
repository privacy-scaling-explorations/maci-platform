import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask } from "@synthetixio/synpress/playwright";

import { PASSWORD, SEED_PHRASE, NETWORKS } from "../constants";

// Define the basic wallet setup
export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, walletPage, PASSWORD);

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE);
  await metamask.addNetwork(NETWORKS.optimismSepolia);
});
