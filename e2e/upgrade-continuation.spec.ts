import { test, expect } from "@playwright/test";
import { setupUpgradeResumeMocks } from "./fixtures/apiMocks";
import { RESUME_REPORT_ID } from "./fixtures/mockPriorAnswers";

test.describe("Paid tier upgrade continuation", () => {
  test.beforeEach(async ({ page }) => {
    await setupUpgradeResumeMocks(page);
  });

  test("loads prior answers and asks net-new capture only", async ({ page }) => {
    await page.goto(
      `/?tier=snapshot-plus&token=test-tier-token&resume=${RESUME_REPORT_ID}&name=Alex`,
    );

    await expect(page.getByText(/Welcome back|answers are already on file/i)).toBeVisible({
      timeout: 30_000,
    });

    const input = page.locator("#brand-message");
    await input.fill("continue");
    await input.press("Enter");

    await expect(page.getByText(/monthly revenue/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/website URL/i)).toHaveCount(0);
    await expect(page.getByText("What I've noted so far")).toBeVisible();
  });
});
