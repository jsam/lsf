# Execute Green Phase

Generate minimal implementations from green phase tasks.

**Usage:** `/execute-green <green-phase.md>`

**Output:**
- Implementation files in appropriate directories
- All tests pass after iteration
- Test registry promoted (new → baseline)

**Implementation:**
1. Parse GREEN-XXX tasks from green-phase.md
2. For each task or batch:
   - Create implementation file at specified location
   - Generate minimal code using specified component
   - Apply required configuration
   - Backend: Django views, models (with Pydantic contracts)
   - Frontend React: Components for UI
   - Frontend E2E: Real browser interactions (no mocks)
3. Execute GREEN-INT integration tasks (URL routing, component imports)
4. **Test Iteration Loop (MANDATORY):**
   - Run ALL tests: `python3 tests/run_all_tests_parallelized.py --json-output`
   - If failed > 0: Analyze, fix, repeat
   - If failed == 0: PROCEED
   - Max iterations: 3-5 (agent decides)
5. Promote tests to baseline:
   - Move all tests from "new" to "baseline" in registry
   - Clear "new" category for next iteration
6. Generate data-plane-current.yaml (if applicable)
7. If data-plane-target.yaml exists, run /check-data-plane
8. Report implementation summary

**Constitutional Compliance:**
- Minimal viable implementation (Minimalism)
- Existing components only (Reasonable Defaults)
- Verification through iteration (Verification)
- No mocking in E2E tests (Verification)