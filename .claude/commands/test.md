---
description: Generate or extend failing test suite for TDD Red phase. Creates comprehensive test coverage encoding acceptance criteria with traceability to tasks.
---

Given the test generation context provided as an argument, do this:

1. Run `.lsf/scripts/bash/test-generation.sh --json "$ARGUMENTS"` from repo root and parse JSON for TEST_DIR, BREAKDOWN_FILE, TASKS_FILE, EPIC_FILE, and GENERATED_TESTS list. All file paths must be absolute.
2. Read and analyze design documents:
   - Load breakdown.md for technical architecture and components
   - Load tasks.md for specific work items requiring tests
   - Load epic.md for acceptance criteria and user scenarios
3. Execute the test generation workflow:
   - Load `.lsf/templates/test-plan-template.md` as the base structure
   - Generate test files under test/ directory structure:
     * test/contract/ - API contract tests
     * test/integration/ - Cross-component integration tests
     * test/unit/ - Component-specific unit tests
   - Create failing tests that encode acceptance criteria
   - Map each test to specific task IDs for traceability
   - Use placeholders (assert False, "Not implemented") for TDD Red phase
   - Ensure comprehensive coverage of all functional requirements
4. Test generation rules:
   - Each user story → integration test scenario
   - Each API endpoint → contract test
   - Each component/entity → unit test suite
   - Each acceptance criterion → specific test case
   - Tests must fail initially (TDD Red requirement)
   - Include task ID references in test docstrings
5. Generate test plan documentation:
   - Create test-plan.md with strategy and coverage matrix
   - Document test-to-task traceability
   - Include test execution instructions
   - Provide failure analysis guidelines
6. Verify test generation:
   - Run test suite to confirm all tests fail appropriately
   - Validate test coverage aligns with acceptance criteria
   - Check constitutional TDD compliance
   - Ensure tests are executable and well-structured
7. Report results with test directory structure, test count by category, and readiness for /implement phase.

Context for test generation: $ARGUMENTS

Note: This command establishes the TDD Red phase by creating comprehensive failing tests that define the acceptance criteria for implementation. Tests serve as executable specifications that guide development.