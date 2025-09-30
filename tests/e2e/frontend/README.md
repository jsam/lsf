# Frontend E2E Tests

End-to-end tests for the frontend using Playwright.

## Setup

```bash
cd tests/e2e/frontend
npm install
npx playwright install
```

## Running Tests

### Prerequisites
1. Backend services must be running: `cd src && docker compose up -d`
2. Frontend dev server must be running: `cd src/frontend && npm run dev`

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Debug a specific test
```bash
npm run test:debug login.spec.js
```

## Test Organization

- `*.spec.js` - Test files
- `playwright.config.js` - Playwright configuration
- `setup.js` - Test fixtures and utilities

## Writing Tests

Tests should follow the E2E-first principle:
- Test real user workflows
- Use real backend API (no mocks)
- Test in real browser
- Keep tests simple and focused

Example:
```javascript
const { test, expect } = require('@playwright/test');

test('user can complete workflow', async ({ page }) => {
  await page.goto('http://localhost:3000/feature');
  await page.fill('[name="input"]', 'test data');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```
