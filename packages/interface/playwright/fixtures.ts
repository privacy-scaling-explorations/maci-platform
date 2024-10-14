import { test as base, chromium, type BrowserContext } from "@playwright/test";
import { initialSetup } from "@synthetixio/synpress/commands/metamask";
import { init, setExpectInstance } from "@synthetixio/synpress/commands/playwright";
import decompress from "decompress";

import fs from "fs";
import path from "path";

import { NETWORKS, TEST_MNEMONIC, TEST_PASSWORD } from "./constants";

const METAMASK_ARCHIVE_PATH = path.resolve(__dirname, "../metamask-chrome-11.15.1.zip");
const METAMASK_OUTPUT_PATH = path.resolve(__dirname, "../metamask");

export const test = base.extend<{
  context: BrowserContext;
}>({
  context: async ({}, use) => {
    if (!fs.existsSync(METAMASK_OUTPUT_PATH)) {
      await decompress(METAMASK_ARCHIVE_PATH, METAMASK_OUTPUT_PATH);
    } else if (process.env.FORCE === "true") {
      await fs.promises.rmdir(METAMASK_OUTPUT_PATH);
      await decompress(METAMASK_ARCHIVE_PATH, METAMASK_OUTPUT_PATH);
    }

    // required for synpress as it shares same expect instance as playwright
    await setExpectInstance(test.expect);

    // prepare browser args
    const browserArgs = [
      `--disable-extensions-except=${METAMASK_OUTPUT_PATH}`,
      `--load-extension=${METAMASK_OUTPUT_PATH}`,
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
