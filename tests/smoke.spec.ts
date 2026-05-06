import { test, expect } from "@playwright/test";

test("loads dashboard bootstrap home", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("InvestPulse")).toBeVisible();
});

test("loads timing analysis page", async ({ page }) => {
  const response = await page.goto("/timing");

  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator("body")).toBeVisible();
});
