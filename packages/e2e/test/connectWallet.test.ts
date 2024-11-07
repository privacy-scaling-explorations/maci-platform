// Import necessary Synpress modules and setup
import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";

import basicSetup from "./wallet-setup/basic.setup";

// Create a test instance with Synpress and BasicSetup
const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Extract expect function from test
const { expect } = test;

// Define a basic test case
test("should connect wallet properly", async ({ context, page, extensionId }) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, page, basicSetup.walletPassword, extensionId);

  // Navigate to the homepage
  await page.goto("/");

  // Click the connect button
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.getByTestId("rk-wallet-option-io.metamask").click();

  // Connect MetaMask to the dapp
  await metamask.connectToDapp();
  await metamask.confirmSignature();

  // Verify the connected account address
  await expect(page.getByText(/0xf3.+2266/)).toBeInViewport({ timeout: 20000 });
});
