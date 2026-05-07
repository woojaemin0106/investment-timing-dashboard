import { test, expect } from "@playwright/test";

test("loads dashboard bootstrap home", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("InvestPulse")).toBeVisible();
});

test("loads timing analysis page", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  const stocksResponse = page.waitForResponse(
    (res) => res.url().includes("/api/stocks") && res.status() < 500
  );

  const response = await page.goto("/timing");
  await stocksResponse;

  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator("main h3").first()).toBeVisible();
  await expect(page.getByText("This page couldn't load")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
