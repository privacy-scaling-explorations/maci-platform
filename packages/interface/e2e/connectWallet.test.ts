import { test, expect } from "../playwright/fixtures";

test.setTimeout(100000);

test.describe.configure({ retries: 2 });

test.describe("connect wallet", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { timeout: 50000 });
    await page.waitForSelector('button:has-text("Connect wallet")', { state: "visible", timeout: 30000 });
  });

  test("should connect wallet using default metamask account", async ({ page }) => {
    await page.getByRole("button", { name: "Connect wallet" }).first().click();
    await page.getByTestId("rk-wallet-option-io.metamask").click();

    const metamask = await page.context().waitForEvent("page", { timeout: 30000 });
    await metamask.getByText("Next").waitFor({ state: "visible", timeout: 10000 });
    await metamask.getByText("Next").click();

    // Wait for the footer next button to be visible and clickable
    await metamask.getByTestId("page-container-footer-next").waitFor({ state: "visible", timeout: 10000 });
    await metamask.getByTestId("page-container-footer-next").click();

    // Replace fixed timeout with a wait for a specific element or state change
    await metamask.getByTestId("page-container-footer-next").waitFor({ state: "visible", timeout: 10000 });
    await metamask.getByTestId("page-container-footer-next").click();

    // Wait for the wallet address to appear with a timeout
    await expect(page.getByText(/0xf3.+2266/)).toBeInViewport({ timeout: 20000 });
  });
});
