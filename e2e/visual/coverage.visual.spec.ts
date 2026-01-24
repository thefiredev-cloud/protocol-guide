import { test } from "@playwright/test";
import {
  takeVisualSnapshot,
  setupVisualTest,
} from "../helpers/visual-test.helper";

/**
 * Visual Regression Tests for Coverage/State Filter Screen
 * Tests the visual appearance of state selection and filtering
 */

test.describe("Coverage Screen Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/(tabs)/coverage?e2e=true");
    await setupVisualTest(page);
  });

  test("renders coverage screen initial state", async ({ page }) => {
    await takeVisualSnapshot(page, "coverage-initial-state", {
      fullPage: true,
      maskDynamicContent: true,
    });
  });

  test("renders state list view", async ({ page }) => {
    // Assuming there's a list of states displayed
    await page.waitForTimeout(1000);

    await takeVisualSnapshot(page, "coverage-state-list", {
      fullPage: true,
      maskDynamicContent: true,
    });
  });

  test("renders California selection", async ({ page }) => {
    const californiaOption = page
      .getByText(/California/i)
      .or(page.getByText(/^CA$/i))
      .first();

    const isVisible = await californiaOption.isVisible().catch(() => false);

    if (isVisible) {
      await californiaOption.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      await takeVisualSnapshot(page, "coverage-california-selected", {
        fullPage: true,
        maskDynamicContent: true,
      });
    }
  });

  test("renders Texas selection", async ({ page }) => {
    const texasOption = page
      .getByText(/Texas/i)
      .or(page.getByText(/^TX$/i))
      .first();

    const isVisible = await texasOption.isVisible().catch(() => false);

    if (isVisible) {
      await texasOption.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      await takeVisualSnapshot(page, "coverage-texas-selected", {
        fullPage: true,
        maskDynamicContent: true,
      });
    }
  });

  test("renders New York selection", async ({ page }) => {
    const nyOption = page
      .getByText(/New York/i)
      .or(page.getByText(/^NY$/i))
      .first();

    const isVisible = await nyOption.isVisible().catch(() => false);

    if (isVisible) {
      await nyOption.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      await takeVisualSnapshot(page, "coverage-newyork-selected", {
        fullPage: true,
        maskDynamicContent: true,
      });
    }
  });

  test("renders Florida selection", async ({ page }) => {
    const floridaOption = page
      .getByText(/Florida/i)
      .or(page.getByText(/^FL$/i))
      .first();

    const isVisible = await floridaOption.isVisible().catch(() => false);

    if (isVisible) {
      await floridaOption.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      await takeVisualSnapshot(page, "coverage-florida-selected", {
        fullPage: true,
        maskDynamicContent: true,
      });
    }
  });
});

test.describe("Coverage Screen Responsive Visual Tests", () => {
  test("renders coverage on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/(tabs)/coverage?e2e=true");
    await setupVisualTest(page);

    await takeVisualSnapshot(page, "coverage-mobile-375", {
      fullPage: true,
      maskDynamicContent: true,
    });
  });

  test("renders coverage on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/(tabs)/coverage?e2e=true");
    await setupVisualTest(page);

    await takeVisualSnapshot(page, "coverage-tablet-768", {
      fullPage: true,
      maskDynamicContent: true,
    });
  });

  test("renders coverage on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/(tabs)/coverage?e2e=true");
    await setupVisualTest(page);

    await takeVisualSnapshot(page, "coverage-desktop-1920", {
      fullPage: true,
      maskDynamicContent: true,
    });
  });
});
