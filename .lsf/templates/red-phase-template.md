# Red Phase: Failing Test Implementation

## Infrastructure Setup Tasks

RED-SETUP-001: Setup test infrastructure for [FEATURE]
- Purpose: Enable [TEST-XXX] execution
- Dependencies: [DATABASE|MOCK|FIXTURES]
- Configuration: [SETTINGS changes needed]
- Verify Setup: `pytest tests/[category] --collect-only`

RED-SETUP-002: Configure test environment for [EXTERNAL_SERVICE]
- Purpose: Mock [SERVICE_NAME] for contract tests
- Dependencies: [MOCK_LIBRARY] configuration
- Configuration: Test service endpoints
- Verify Setup: `python -c "import tests.mocks.[service]; print('OK')"`

## Test Implementation Tasks

RED-001: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: Integration
- File Location: tests/integration/test_[feature].py
- Function Name: test_[scenario]()
- Expected Failure: [SPECIFIC failure reason]
- Verify Failure: `pytest tests/integration/test_[feature].py::test_[scenario] --tb=short`

RED-002: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: Backend Contract
- File Location: tests/contract/test_[api].py
- Function Name: test_[endpoint]()
- Expected Failure: [API endpoint not implemented]
- Verify Failure: `pytest tests/contract/test_[api].py::test_[endpoint] --tb=short`

RED-003: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: Frontend Integration
- File Location: src/frontend/tests/integration/[Feature].test.tsx
- Function Name: test_[scenario]()
- Expected Failure: [Component not implemented]
- Verify Failure: `npm test -- [Feature].test.tsx`

RED-004: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: Backend Unit
- File Location: tests/unit/test_[module].py
- Function Name: test_[algorithm]()
- Expected Failure: [Function not implemented]
- Verify Failure: `pytest tests/unit/test_[module].py::test_[algorithm] --tb=short`

RED-005: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: Frontend Unit
- File Location: src/frontend/tests/unit/[module].test.ts
- Function Name: test_[function]()
- Expected Failure: [Function not implemented]
- Verify Failure: `npm test -- [module].test.ts`

RED-006: Write failing test [TEST-XXX]
- Traceability: [TEST-XXX→REQ-XXX→OUT-XXX]
- Test Type: Load
- File Location: tests/performance/test_[feature].py
- Function Name: test_[performance_scenario]()
- Expected Failure: [Performance target not met]
- Verify Failure: `python tests/performance/test_[feature].py --test=[id]`

## Validation Tasks

RED-VALIDATE-001: Verify all tests fail as expected
- Command: `pytest tests/ --tb=line | grep FAILED`
- Expected: All RED-XXX tests show FAILED status
- Success: No passing tests in red phase

RED-VALIDATE-002: Verify test infrastructure is complete
- Command: `pytest tests/ --collect-only`
- Expected: All test files discovered without import errors
- Success: Clean collection without missing dependencies

---
<!--
Layer: 3A
Type: red-phase
Input: requirements.md, test-cases.md
Dependencies: .lsf/memory/architecture-boundaries.md
-->