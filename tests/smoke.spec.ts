import { test, expect } from "@playwright/test";

test("loads dashboard bootstrap home", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("InvestPulse")).toBeVisible();
});
