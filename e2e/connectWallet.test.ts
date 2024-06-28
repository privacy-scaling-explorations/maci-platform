import { test, expect } from "../playwright/fixtures";

test.describe("connect wallet", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should connect wallet using default metamask account", async ({ page }) => {
    await page.getByText(/Connect wallet/).click();
    await page.getByTestId("rk-wallet-option-io.metamask").click();

    const metamask = await page.context().waitForEvent("page");
    await metamask.getByText("Next").click();
    await metamask.getByTestId("page-container-footer-next").click();

    await metamask.waitForTimeout(2_000);
    await metamask.getByTestId("page-container-footer-next").click();

    await expect(page.getByText(/0xf3.+2266/)).toBeInViewport();
  });
});
