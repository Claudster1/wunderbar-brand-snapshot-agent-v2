import { test, expect } from "@playwright/test";
import { setupSeamlessFinalizeMocks } from "./fixtures/apiMocks";

test.describe("Seamless intake wrap-up", () => {
  test.beforeEach(async ({ page }) => {
    await setupSeamlessFinalizeMocks(page);
  });

  test("auto-finalizes, shows bottom dock, and navigates to results", async ({ page }) => {
    await page.goto("/?name=Alex");
    await expect(page.locator("#brand-message")).toBeVisible({ timeout: 20_000 });

    const input = page.locator("#brand-message");
    await input.fill("Acme Agency");
    await input.press("Enter");
    await expect(page.getByText(/What's the name of your business/i)).toBeVisible({ timeout: 15_000 });

    await input.fill("https://acme.example");
    await input.press("Enter");

    await expect(page.getByText(/being assembled now/i)).toBeVisible({ timeout: 15_000 });

    await expect(page.locator(".chat-finalize-dock")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".chat-finalize-dock-title")).toContainText(/Preparing your|Building your/i);
    await expect(page.locator("#brand-message")).toBeHidden({ timeout: 5_000 });
    await expect(page.getByRole("button", { name: /Generate my/i })).toHaveCount(0);

    await page.waitForURL(/\/results\?reportId=/, { timeout: 25_000 });
    await expect(page).toHaveURL(/reportId=e2e-seamless-report-001/);
  });
});
