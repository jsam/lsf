# Red Phase Derivation Instruction

## Required References
- requirements.md (Layer 2)
- test-cases.md (Layer 2)
- tests/ directory structure (existing patterns)
- architecture-boundaries-v3.md (test infrastructure patterns)

## Input
- requirements.md with REQ-XXX: [OUT-XXX] entries
- test-cases.md with TEST-XXX: [REQ-XXX→OUT-XXX] entries

## Task
Generate failing test implementation tasks that verify each requirement through TDD red phase.

## Processing Rules

### Step 1: Input Validation
1. Extract all TEST-XXX entries from test-cases.md
2. Verify each TEST-XXX links to valid REQ-XXX from requirements.md
3. Confirm traceability chain: TEST → REQ → OUT is complete
4. Identify test infrastructure gaps

### Step 2: Task Generation
For each TEST-XXX:
1. Create RED-XXX task to implement the failing test
2. Map test type to existing infrastructure pattern:
   - Integration → tests/integration/
   - Contract → tests/contract/
   - Load → tests/performance/
   - Unit → tests/unit/
3. Generate infrastructure setup tasks where needed
4. Include exact verification commands

### Test Type Mapping Rules

**Backend Integration Tests (Django)**:
- File: `tests/integration/test_[feature].py`
- Pattern: Django TestCase with database
- Setup: Fixtures, test client
- Verify: `pytest tests/integration/test_[feature].py::test_[scenario]`

**Backend Contract Tests (API)**:
- File: `tests/contract/test_[api].py`
- Pattern: API endpoint validation
- Setup: Mock external services
- Verify: `pytest tests/contract/test_[api].py::test_[endpoint]`

**Backend Unit Tests (Python)**:
- File: `tests/unit/test_[module].py`
- Pattern: Algorithm testing only
- Setup: Minimal fixtures
- Verify: `pytest tests/unit/test_[module].py::test_[function]`

**Frontend Integration Tests (React)**:
- File: `src/frontend/tests/integration/[Feature].test.tsx`
- Pattern: Vitest with Testing Library
- Setup: Component rendering, user events
- Verify: `npm test -- [Feature].test.tsx`

**Frontend Unit Tests (TypeScript)**:
- File: `src/frontend/tests/unit/[module].test.ts`
- Pattern: Vitest function testing
- Setup: Mock dependencies
- Verify: `npm test -- [module].test.ts`

**Load Tests (System-wide)**:
- File: `tests/performance/test_[feature].py`
- Pattern: Performance benchmarking
- Setup: Load generation tools
- Verify: `python tests/performance/test_[feature].py --test=[id]`

## Output Format

### RED Task Structure
```markdown
RED-XXX: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: [Integration|Contract|Load|Unit]
- File Location: tests/[category]/test_[feature].py
- Function Name: test_[scenario]()
- Expected Failure: [SPECIFIC failure reason]
- Verify Failure: `pytest [exact path] --tb=short`
```

### Infrastructure Task Structure
```markdown
RED-SETUP-XXX: Setup test infrastructure for [FEATURE]
- Purpose: Enable [TEST-XXX] execution
- Dependencies: [DATABASE|MOCK|FIXTURES]
- Configuration: [SETTINGS changes needed]
- Verify Setup: `pytest [path] --collect-only`
```

## Task Ordering Rules

1. **Infrastructure First**: All RED-SETUP-XXX before RED-XXX
2. **Dependency Order**: Database setup before API tests
3. **Mock Order**: External service mocks before integration tests
4. **Validation Order**: Contract tests before integration tests

## Forbidden Patterns

- Custom test frameworks (use pytest for backend, Vitest for frontend)
- Cross-stack testing (no pytest for React, no Vitest for Django)
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