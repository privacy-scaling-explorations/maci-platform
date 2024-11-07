import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./test",
  timeout: process.env.CI ? 120_000 : 60_000,
  expect: {
    timeout: 15_000,
  },
  maxFailures: 2,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["github"], ["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.DEMO_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: !process.env.DEMO_URL
    ? [
        {
          command: "pnpm run start",
          cwd: path.resolve("../interface"),
          url: "http://localhost:3000",
          timeout: 120 * 1000,
          reuseExistingServer: true,
        },
      ]
    : [],
});
