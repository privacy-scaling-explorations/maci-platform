import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask, getExtensionId } from "@synthetixio/synpress/playwright";
import "dotenv/config";

import { NETWORKS, PASSWORD, SEED_PHRASE } from "../constants";

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // This is a workaround for the fact that the MetaMask extension ID changes.
  // This workaround won't be needed in the near future! 😁
  const extensionId = await getExtensionId(context, "MetaMask");

  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);

  await metamask.importWallet(SEED_PHRASE);
  await metamask.addNetwork(NETWORKS.optimismSepolia);

  const page = await context.newPage();

  // Go to a locally hosted MetaMask Test Dapp.
  await page.goto(process.env.DEMO_URL || "http://localhost:3000");

  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.getByTestId("rk-wallet-option-io.metamask").click();

  await metamask.connectToDapp(["Account 1"]);
});
