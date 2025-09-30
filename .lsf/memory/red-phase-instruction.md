# Red Phase Derivation Instruction

## Required References
- .lsf/memory/environment-setup-checklist.md (pre-execution environment)
- requirements.md (Layer 2)
- test-cases.md (Layer 2)
- tests/ directory structure (existing patterns)
- .lsf/memory/architecture-boundaries.md (test infrastructure patterns)

## Input
- requirements.md with REQ-XXX: [OUT-XXX] entries
- test-cases.md with TEST-XXX: [REQ-XXX→OUT-XXX] entries

## Task
Generate failing test implementation tasks that verify each requirement through TDD red phase.

## Processing Rules

### Step 0: Environment Verification
1. Verify .lsf/memory/environment-setup-checklist.md requirements are met
2. If environment not ready, output: "BLOCKED: Complete .lsf/memory/environment-setup-checklist.md first"
3. Continue only if environment verified

### Step 1: Input Validation
1. Extract all TEST-XXX entries from test-cases.md
2. Verify each TEST-XXX links to valid REQ-XXX from requirements.md
3. Confirm traceability chain: TEST → REQ → OUT is complete
4. Identify test infrastructure gaps

### Step 2: Task Generation
For each TEST-XXX:
1. Create RED-XXX task to implement the failing test
2. Map test type to existing infrastructure pattern:
   - Backend Integration → tests/integration/
   - Backend Unit → tests/unit/
   - Frontend E2E → tests/e2e/frontend/
   - Frontend Unit → src/frontend/tests/unit/
3. Generate infrastructure setup tasks where needed
4. Include exact verification commands
5. Update test registry with new test paths (tests/test-registry.json)

### Test Type Mapping Rules

**Backend Integration Tests (pytest)** - PRIMARY (90%):
- File: `tests/integration/test_[feature].py`
- Pattern: pytest with requests library, real Docker services, real database
- Setup: Docker services running, test fixtures
- Verify: `pytest tests/integration/test_[feature].py::test_[scenario]`
- Usage: API endpoints, service workflows, data pipelines

**Backend Unit Tests (pytest)** - MINIMAL (10%):
- File: `tests/unit/test_[module].py`
- Pattern: pytest for pure algorithms only, no mocks
- Setup: Minimal fixtures
- Verify: `pytest tests/unit/test_[module].py::test_[function]`
- Usage: Complex algorithms, pure functions with edge cases

**Frontend E2E Tests (Playwright)** - PRIMARY (90%):
- File: `tests/e2e/frontend/[feature].spec.js`
- Pattern: Playwright with real browser + real backend API
- Setup: Backend services running, frontend dev server running
- Verify: `cd tests/e2e/frontend && npx playwright test [feature].spec.js`
- Usage: User workflows, UI interactions, page navigation, form submissions

**Frontend Unit Tests (Vitest)** - MINIMAL (10%):
- File: `src/frontend/tests/unit/[module].test.js`
- Pattern: Vitest for pure utility functions only, no mocks
- Setup: Minimal, no rendering
- Verify: `cd src/frontend && npm run test:unit -- [module].test.js`
- Usage: Pure utility functions, formatters, validators

**Deprecated Test Types (DO NOT USE)**:
- ❌ Frontend Integration Tests (Vitest with component mocks) → Use Frontend E2E instead
- ❌ Backend Contract Tests → Use Backend Integration with real services
- ❌ Backend Load Tests → Not in scope (YAGNI, minimalism)

## Output Format

### RED Task Structure
```markdown
RED-XXX: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: [Backend Integration|Backend Unit|Frontend E2E|Frontend Unit]
- File Location: tests/integration/test_[feature].py OR tests/e2e/frontend/[feature].spec.js
- Function Name: test_[scenario]() OR test('[scenario]')
- Expected Failure: [SPECIFIC failure reason - NotImplementedError, 404, route not found, etc.]
- Verify Failure: `pytest [path]` OR `cd tests/e2e/frontend && npx playwright test [file]`
- Registry Category: [backend_integration|backend_unit|frontend_e2e|frontend_unit]
```

### Infrastructure Task Structure
```markdown
RED-SETUP-XXX: Setup test infrastructure for [FEATURE]
- Purpose: Enable [TEST-XXX] execution
- Dependencies: [DATABASE|MOCK|FIXTURES|PLAYWRIGHT]
- Configuration: [SETTINGS changes needed]
- Verify Setup: `pytest [path] --collect-only` OR `npx playwright test --list`
```

### Test Registry Update
After generating all RED tasks:
```python
import json
from pathlib import Path

registry = json.loads(Path("tests/test-registry.json").read_text())

# Add each new test to appropriate category
registry["new"]["backend_integration"].append("tests/integration/test_feature_x.py")
registry["new"]["frontend_e2e"].append("tests/e2e/frontend/feature_x.spec.js")

Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

## Baseline Verification (MANDATORY)

### Before Generating Tests
```bash
# Verify baseline tests pass
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: STOP - "Baseline tests failing - fix before proceeding"
- If `passed == 0` and baseline not empty: ERROR - "No baseline tests executed"
- If `passed > 0 && failed == 0`: PROCEED with RED phase

**Rationale:** Drift detection - ensure starting state is clean

### After Generating Tests
```bash
# Verify new tests fail as expected
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `passed > 0`: STOP - "New tests should fail in RED phase"
- If `failed == 0`: ERROR - "No new tests were executed"
- If `failed > 0 && passed == 0`: PROCEED

**Verify baseline unchanged:**
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```
- Should still have `failed == 0` (new tests didn't break baseline)

## Task Ordering Rules

1. **Infrastructure First**: All RED-SETUP-XXX before RED-XXX
2. **Dependency Order**: Database setup before API tests
3. **Mock Order**: External service mocks before integration tests
4. **Validation Order**: Contract tests before integration tests

## Forbidden Patterns

- Custom test frameworks (use pytest for backend, Playwright for frontend E2E, Vitest for frontend unit)
- Cross-stack testing (no pytest for React, no Vitest for Django, no Playwright for backend)
- Mocked component tests (use Playwright E2E for frontend workflows)
- Mocked API responses in E2E tests (use real backend)
- Frontend integration tests with Vitest (deprecated - use E2E or unit)
- Backend contract tests (use integration with real services)
- Backend load tests (not in scope - YAGNI)
- Test implementation code (only task definitions)
- Business logic in tests (test behavior only)
- Passing tests (must fail initially)
- Test duplication across categories

## Validation Checklist

- [ ] Every TEST-XXX from test-cases.md → exactly one RED-XXX
- [ ] Every RED-XXX references complete traceability chain
- [ ] All test files map to existing directory structure
- [ ] All verification commands are executable
- [ ] Infrastructure tasks cover all dependencies
- [ ] Task ordering prevents dependency conflicts
- [ ] No implementation details, only task specifications

## Example Transformation

### Input (test-cases.md):
```
TEST-001: [REQ-001→OUT-001]
- Type: Integration
- Input: POST /api/tasks/ {"title": "Test"}
- Expected: 201 with task ID
- Verify: `pytest tests/integration/test_tasks.py::test_create`
```

### Output (red-phase.md):
```
RED-001: Write failing test [TEST-001]
- Traceability: [TEST-001→REQ-001→OUT-001]
- Test Type: Integration
- File Location: tests/integration/test_tasks.py
- Function Name: test_create()
- Expected Failure: ImportError (Task model not implemented)
- Verify Failure: `pytest tests/integration/test_tasks.py::test_create --tb=short`

RED-SETUP-001: Setup test infrastructure for Tasks
- Purpose: Enable TEST-001 execution
- Dependencies: DATABASE fixtures, Task model mock
- Configuration: DATABASES test settings
- Verify Setup: `pytest tests/integration --collect-only`
```

## Success Criteria

- All tests in test-cases.md mapped to RED tasks
- Complete traceability chain preserved
- Existing test infrastructure patterns reused
- No custom test framework components
- All verification commands ready for execution
- Task ordering prevents dependency issues
- Output ready for agent execution without interpretation