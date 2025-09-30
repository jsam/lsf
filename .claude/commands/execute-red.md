# Execute Red Phase

Generate failing test implementations from red phase tasks.

**Usage:** `/execute-red <red-phase.md>`

**Output:**
- Test files in appropriate directories (tests/integration/, tests/e2e/frontend/, tests/unit/)
- All tests fail with expected reasons
- Test registry updated (tests/test-registry.json)

**Prerequisites:**
- Backend services running (Docker) for backend tests
- Frontend dev server running (npm run dev) for E2E tests
- Baseline tests passing (verified before generating new tests)

**Implementation:**
1. Verify baseline integrity: `python3 tests/run_all_tests_parallelized.py --baseline-only --json-output`
2. Parse RED-XXX tasks from red-phase.md
3. For each task:
   - Create test file at specified location
   - Generate failing test with correct framework (pytest/Playwright/Vitest)
   - Backend Integration: pytest with real services
   - Frontend E2E: Playwright with real browser + real API
   - Unit tests: Pure functions only (no mocks)
4. Update test registry (add to "new" category)
5. Execute RED-SETUP infrastructure tasks (Playwright install if needed)
6. Verify new tests fail: `python3 tests/run_all_tests_parallelized.py --new-only --json-output`
7. Verify baseline unchanged
8. Report test failure summary

**Constitutional Compliance:**
- Test-first development (Verification)
- E2E-first testing (90% integration/E2E, 10% unit)
- Real services, no mocks (Verification)
- Framework defaults (pytest/Playwright/Vitest)