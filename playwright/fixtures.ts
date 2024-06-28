import { test as base, chromium, type BrowserContext } from "@playwright/test";
import { initialSetup } from "@synthetixio/synpress/commands/metamask";
import { init, setExpectInstance } from "@synthetixio/synpress/commands/playwright";
import { prepareMetamask } from "@synthetixio/synpress/helpers";

import { NETWORKS, TEST_MNEMONIC, TEST_PASSWORD } from "./constants";

export const test = base.extend<{
  context: BrowserContext;
}>({
  context: async ({}, use) => {
    // required for synpress as it shares same expect instance as playwright
    await setExpectInstance(test.expect);

    // download metamask
    const metamaskPath = await prepareMetamask(process.env.METAMASK_VERSION || "11.15.1");

    // prepare browser args
    const browserArgs = [
      `--disable-extensions-except=${metamaskPath}`,
      `--load-extension=${metamaskPath}`,
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-gpu",
      "--remote-debugging-port=9222",
    ];

    if (process.env.CI) {
      browserArgs.push("--disable-gpu");
    }

    if (process.env.HEADLESS_MODE) {
      browserArgs.push("--headless=new");
    }

    // launch browser
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: browserArgs,
    });

    await init(context.browser());

    await context.pages()[0]!.waitForTimeout(5000);

    // setup metamask
    await initialSetup(chromium, {
      secretWordsOrPrivateKey: process.env.TEST_MNEMONIC || TEST_MNEMONIC,
      network: NETWORKS[process.env.NEXT_PUBLIC_CHAIN_NAME!] || process.env.NEXT_PUBLIC_CHAIN_NAME!,
      password: TEST_PASSWORD,
      enableAdvancedSettings: true,
    });

    await use(context);

    if (!process.env.SERIAL_MODE) {
      await context.close();
    }
  },
});

export const { expect } = test;
