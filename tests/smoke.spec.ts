import { expect, test } from "@playwright/test";

test("loads dashboard bootstrap home", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Timing Analysis Dashboard" }),
  ).toBeVisible();
});
