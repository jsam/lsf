# Red Phase Discrimination

Run appropriate discriminators for Layer 3A (red phase) with aggregated output.

**Usage:** `/discriminate-red <red-phase.md>`

**Purpose:** Validate red phase artifacts for constitutional compliance before test implementation.

**Active Discriminators:**
- Test-Code Coupling: Ensures tests fail for correct reasons (missing implementation, not syntax)
- Stack Contamination: Enforces correct test framework boundaries (pytest/Playwright/Vitest)
- Hallucination Prevention: Validates test targets exist/will exist
- E2E-First Compliance: Enforces 90/10 ratio, rejects mocked tests
- Baseline Integrity: Verifies existing tests still pass

**Implementation:**
1. Verify baseline tests pass: `python3 tests/run_all_tests_parallelized.py --baseline-only --json-output`
2. Run coupling-check to validate proper test failure patterns
3. Run stack-check to enforce pytest/Playwright/Vitest boundaries
4. Run e2e-compliance-check to validate:
   - Frontend tests in `tests/e2e/frontend/*.spec.js` (not src/frontend/tests/integration/)
   - No mocked API responses (no page.route, no MSW)
   - Real services only (Playwright with real browser + real backend)
5. Run hallucination-check to verify test target validity
6. Aggregate results into single PASS/BLOCKED decision
7. Output structured report for agent consumption with test-specific violations