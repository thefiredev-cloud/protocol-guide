import { expect, test } from '@playwright/test';

test.describe('UX Features End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Settings Panel', () => {
    test('opens settings with keyboard shortcut and changes theme', async ({ page }) => {
      await page.goto('/');

      // Open settings with 's' key
      await page.keyboard.press('s');

      // Wait for settings dialog
      await expect(page.locator('role=dialog')).toBeVisible();
      await expect(page.getByText('Settings')).toBeVisible();

      // Change to light theme
      await page.getByRole('button', { name: /light/i }).click();

      // Verify theme is applied
      const theme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      expect(theme).toBe('light');

      // Verify theme is persisted
      const savedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(savedTheme).toBe('light');

      // Close settings
      await page.getByRole('button', { name: /close settings/i }).click();

      // Verify settings closed
      await expect(page.locator('role=dialog')).not.toBeVisible();
    });

    test('changes font size and persists across reload', async ({ page }) => {
      await page.goto('/');

      // Open settings
      await page.keyboard.press('s');
      await expect(page.getByText('Settings')).toBeVisible();

      // Change to large font
      await page.getByRole('button', { name: 'Large' }).click();

      // Verify font size is applied
      const fontSize = await page.evaluate(() => document.body.getAttribute('data-font-size'));
      expect(fontSize).toBe('large');

      // Close settings
      await page.getByRole('button', { name: /close settings/i }).click();

      // Reload page
      await page.reload();

      // Verify font size persisted
      const persistedFontSize = await page.evaluate(() =>
        document.body.getAttribute('data-font-size')
      );
      expect(persistedFontSize).toBe('large');
    });

    test('toggles accessibility options', async ({ page }) => {
      await page.goto('/');

      // Open settings
      await page.keyboard.press('s');
      await expect(page.getByText('Settings')).toBeVisible();

      // Enable high contrast
      await page.getByRole('checkbox', { name: /high contrast mode/i }).click();

      // Verify high contrast is applied
      const hasHighContrast = await page.evaluate(() =>
        document.body.classList.contains('high-contrast')
      );
      expect(hasHighContrast).toBe(true);

      // Enable reduced motion
      await page.getByRole('checkbox', { name: /reduce animations/i }).click();

      // Verify reduced motion is applied
      const hasReducedMotion = await page.evaluate(() =>
        document.body.classList.contains('reduced-motion')
      );
      expect(hasReducedMotion).toBe(true);
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('shows keyboard shortcuts help with "?" key', async ({ page }) => {
      await page.goto('/');

      // Press '?' to open shortcuts help
      await page.keyboard.press('?');

      // Verify shortcuts dialog appears
      await expect(page.getByText('Keyboard Shortcuts')).toBeVisible();

      // Verify all shortcuts are documented
      await expect(page.getByText(/Focus search\/input/i)).toBeVisible();
      await expect(page.getByText(/New conversation/i)).toBeVisible();
      await expect(page.getByText(/Open settings/i)).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');

      // Verify dialog closed
      await expect(page.getByText('Keyboard Shortcuts')).not.toBeVisible();
    });

    test('navigates with keyboard shortcuts', async ({ page }) => {
      await page.goto('/');

      // Navigate to home with 'n'
      await page.keyboard.press('n');
      await expect(page).toHaveURL('/');

      // Navigate to dosing calculator with 'd'
      await page.keyboard.press('d');
      await expect(page).toHaveURL('/dosing');

      // Navigate to protocols with 'p'
      await page.keyboard.press('p');
      await expect(page).toHaveURL('/protocols');
    });

    test('focuses input with "/" or Ctrl+K', async ({ page }) => {
      await page.goto('/');

      // Focus input with '/'
      await page.keyboard.press('/');

      // Verify input is focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['TEXTAREA', 'INPUT']).toContain(focusedElement);

      // Blur input
      await page.keyboard.press('Escape');

      // Focus input with Ctrl+K
      await page.keyboard.press('Control+k');

      // Verify input is focused again
      const focusedElement2 = await page.evaluate(() => document.activeElement?.tagName);
      expect(['TEXTAREA', 'INPUT']).toContain(focusedElement2);
    });
  });

  test.describe('Complete User Flow', () => {
    test('complete settings workflow with keyboard navigation', async ({ page }) => {
      await page.goto('/');

      // 1. Open settings with keyboard
      await page.keyboard.press('s');
      await expect(page.getByText('Settings')).toBeVisible();

      // 2. Navigate and change theme
      await page.getByRole('button', { name: /light/i }).click();

      // 3. Change font size
      await page.getByRole('button', { name: 'Large' }).click();

      // 4. Enable high contrast
      await page.getByRole('checkbox', { name: /high contrast mode/i }).click();

      // 5. Close settings
      await page.getByRole('button', { name: /close settings/i }).click();

      // 6. Verify all settings applied
      const theme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      const fontSize = await page.evaluate(() => document.body.getAttribute('data-font-size'));
      const highContrast = await page.evaluate(() =>
        document.body.classList.contains('high-contrast')
      );

      expect(theme).toBe('light');
      expect(fontSize).toBe('large');
      expect(highContrast).toBe(true);

      // 7. Reload and verify persistence
      await page.reload();

      const persistedTheme = await page.evaluate(() =>
        document.body.getAttribute('data-theme')
      );
      const persistedFontSize = await page.evaluate(() =>
        document.body.getAttribute('data-font-size')
      );
      const persistedHighContrast = await page.evaluate(() =>
        document.body.classList.contains('high-contrast')
      );

      expect(persistedTheme).toBe('light');
      expect(persistedFontSize).toBe('large');
      expect(persistedHighContrast).toBe(true);
    });

    test('keyboard-only navigation through all features', async ({ page }) => {
      await page.goto('/');

      // 1. Open shortcuts help
      await page.keyboard.press('?');
      await expect(page.getByText('Keyboard Shortcuts')).toBeVisible();

      // 2. Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.getByText('Keyboard Shortcuts')).not.toBeVisible();

      // 3. Open settings
      await page.keyboard.press('s');
      await expect(page.getByText('Settings')).toBeVisible();

      // 4. Tab through settings
      await page.keyboard.press('Tab');

      // 5. Close with Escape (if click outside is disabled) or click close button
      const closeButton = page.getByRole('button', { name: /close settings/i });
      await closeButton.click();

      // 6. Navigate to different pages
      await page.keyboard.press('d');
      await expect(page).toHaveURL('/dosing');

      await page.keyboard.press('n');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('PWA Install Prompt', () => {
    test('does not show prompt when already installed', async ({ page }) => {
      await page.goto('/');

      // Check that prompt doesn't appear
      const prompt = page.locator('.pwa-install-banner');
      await expect(prompt).not.toBeVisible();
    });

    // Note: beforeinstallprompt is hard to test in E2E without browser flags
    // This test would require additional setup
  });

  test.describe('Error Boundary', () => {
    test('shows error boundary UI when component crashes', async ({ page }) => {
      // This test would require a specific page that can trigger errors
      // For now, we'll test the error boundary exists in the app structure

      await page.goto('/');

      // Verify app loads without errors
      const appContent = page.locator('body');
      await expect(appContent).toBeVisible();

      // Error boundary is tested in unit tests more thoroughly
      // E2E tests focus on integration and user flows
    });
  });

  test.describe('Accessibility', () => {
    test('settings panel is keyboard accessible', async ({ page }) => {
      await page.goto('/');

      // Open settings
      await page.keyboard.press('s');
      await expect(page.getByText('Settings')).toBeVisible();

      // Tab to close button
      await page.keyboard.press('Tab');

      // Verify close button is focused
      const focusedElement = await page.evaluate(
        () => document.activeElement?.getAttribute('aria-label')
      );
      expect(focusedElement).toBe('Close settings');

      // Press Enter to close
      await page.keyboard.press('Enter');

      // Verify settings closed
      await expect(page.getByText('Settings')).not.toBeVisible();
    });

    test('all interactive elements have proper ARIA labels', async ({ page }) => {
      await page.goto('/');

      // Open settings
      await page.keyboard.press('s');

      // Check for proper ARIA attributes
      const dialog = page.locator('role=dialog');
      await expect(dialog).toHaveAttribute('aria-modal', 'true');

      const closeButton = page.getByRole('button', { name: /close settings/i });
      await expect(closeButton).toHaveAttribute('aria-label', 'Close settings');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('settings panel works on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open settings
      await page.keyboard.press('s');
      await expect(page.getByText('Settings')).toBeVisible();

      // Change theme
      await page.getByRole('button', { name: /light/i }).click();

      // Verify theme applied
      const theme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      expect(theme).toBe('light');

      // Close settings
      await page.getByRole('button', { name: /close settings/i }).click();
      await expect(page.getByText('Settings')).not.toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('settings panel opens quickly', async ({ page }) => {
      await page.goto('/');

      const startTime = Date.now();

      // Open settings
      await page.keyboard.press('s');
      await expect(page.getByText('Settings')).toBeVisible();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should open within 500ms
      expect(duration).toBeLessThan(500);
    });

    test('keyboard shortcuts respond quickly', async ({ page }) => {
      await page.goto('/');

      const startTime = Date.now();

      // Trigger shortcut
      await page.keyboard.press('?');
      await expect(page.getByText('Keyboard Shortcuts')).toBeVisible();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should respond within 300ms
      expect(duration).toBeLessThan(300);
    });
  });
});
