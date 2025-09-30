// Test setup and fixtures for E2E tests
const { test as base } = require('@playwright/test');

/**
 * Extend base test with custom fixtures if needed
 */
const test = base.extend({
  // Example: authenticated page fixture
  // authenticatedPage: async ({ page }, use) => {
  //   await page.goto('/login');
  //   await page.fill('[name="email"]', 'test@example.com');
  //   await page.fill('[name="password"]', 'password');
  //   await page.click('button[type="submit"]');
  //   await page.waitForURL('/dashboard');
  //   await use(page);
  // },
});

module.exports = { test };
