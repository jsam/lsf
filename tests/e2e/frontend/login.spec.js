// E2E test for login workflow
const { test, expect } = require('@playwright/test');

test.describe('Login Workflow', () => {
  test('user can log in successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Fill in credentials
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|home)/);

    // Verify user is logged in (check for logout button or user menu)
    await expect(page.locator('text=/log out/i')).toBeVisible();
  });

  test('login fails with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Fill in invalid credentials
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message appears
    await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible();

    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);
  });
});
