import { test, expect } from "@playwright/test";
import { setupSnapshotChatMocks } from "./fixtures/apiMocks";

test.describe("Snapshot intake golden path", () => {
  test.beforeEach(async ({ page }) => {
    await setupSnapshotChatMocks(page);
  });

  test("shows server-driven progress after the user starts chatting", async ({ page }) => {
    await page.goto("/?name=Alex");
    await expect(page.locator("#brand-message")).toBeVisible({ timeout: 20_000 });

    await expect(page.locator(".assessment-progress-wrap")).toBeHidden();

    const input = page.locator("#brand-message");
    await input.fill("Acme Agency");
    await input.press("Enter");

    // Mocked first assistant turn must match setupSnapshotChatMocks (proves /api/brand-snapshot succeeded).
    await expect(page.getByText(/What's the name of your business/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/I ran into a connection issue/i)).toHaveCount(0);

    await expect(page.locator(".assessment-progress-wrap")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".assessment-progress-label")).toContainText("% complete");
    await expect(page.getByText(/business/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
