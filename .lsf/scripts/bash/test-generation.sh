#!/usr/bin/env bash
# Generate failing test suite for TDD Red phase
set -e

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] [test_options]"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

TEST_OPTIONS="${ARGS[*]}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

eval $(get_feature_paths)
check_feature_branch "$CURRENT_BRANCH" || exit 1

# Validate prerequisites  
if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR" >&2
    exit 1
fi

# Check for required files (breakdown.md and epic.md)
BREAKDOWN_FILE="$FEATURE_DIR/breakdown.md"
EPIC_FILE="$FEATURE_DIR/epic.md"

if [[ ! -f "$BREAKDOWN_FILE" ]]; then
    echo "ERROR: breakdown.md not found in $FEATURE_DIR" >&2
    echo "Run /breakdown first." >&2
    exit 1
fi

if [[ ! -f "$EPIC_FILE" ]]; then
    echo "ERROR: No epic.md found in $FEATURE_DIR" >&2
    echo "Run /epic first." >&2
    exit 1
fi

# Set up test directory structure
TEST_DIR="$REPO_ROOT/test"
mkdir -p "$TEST_DIR/contract"
mkdir -p "$TEST_DIR/integration" 
mkdir -p "$TEST_DIR/unit"

# Create test plan file
TEST_PLAN_FILE="$FEATURE_DIR/test-plan.md"

# Generate test plan template
cat > "$TEST_PLAN_FILE" << 'EOF'
# Test Plan: [FEATURE]

## Test Strategy
- **Contract Tests**: API interface validation
- **Integration Tests**: Cross-component behavior
- **Unit Tests**: Component-specific functionality

## Test Coverage Matrix
| Requirement | Contract Test | Integration Test | Unit Test |
|-------------|---------------|------------------|-----------|
| [Req 1]     | [ ]          | [ ]             | [ ]       |

## Test Execution
- All tests should fail initially (TDD Red phase)
- Tests serve as executable specifications
- Implementation guided by making tests pass

## Traceability
- Each test maps to specific task IDs
- Requirements traced through test cases
- Coverage gaps identified and addressed
EOF

# Generate basic test files
GENERATED_TESTS=()

# Contract tests (if API endpoints exist)
if grep -q -i "endpoint\|api\|service" "$BREAKDOWN_FILE" 2>/dev/null; then
    CONTRACT_TEST="$TEST_DIR/contract/test_api_contract.py"
    cat > "$CONTRACT_TEST" << 'EOF'
"""
Contract tests for API interfaces
Linked to: P1-002, P1-003
Requirements: ER-001, ER-003 (from epic.md)

This test file is automatically linked to tasks P1-002, P1-003.
Update TASK_METADATA below to maintain traceability.
"""
import pytest

class TestAPIContract:
    """Test API contract compliance"""
    
    def test_endpoint_exists(self):
        """Verify API endpoints are available"""
        assert False, "Not implemented - add actual endpoint tests"
    
    def test_request_format(self):
        """Validate request format requirements"""  
        assert False, "Not implemented - add request validation"
    
    def test_response_format(self):
        """Validate response format requirements"""
        assert False, "Not implemented - add response validation"

# Task traceability metadata
TASK_METADATA = {
    "linked_tasks": ["P1-002", "P1-003"],
    "requirements": ["ER-001", "ER-003"],
    "test_type": "contract",
    "test_functions": [
        "test_endpoint_exists", 
        "test_request_format",
        "test_response_format"
    ]
}
EOF
    GENERATED_TESTS+=("contract/test_api_contract.py")
fi

# Integration tests
INTEGRATION_TEST="$TEST_DIR/integration/test_feature_integration.py"
cat > "$INTEGRATION_TEST" << 'EOF'
"""
Integration tests for feature workflow
Linked to: P1-003, P1-009
Requirements: ER-002, ER-004 (from epic.md)

This test file validates end-to-end feature behavior.
Tests are linked to integration and quality tasks.
"""
import pytest

class TestFeatureIntegration:
    """Test end-to-end feature behavior"""
    
    def test_primary_user_story(self):
        """Test main user workflow end-to-end"""
        assert False, "Not implemented - add user story test"
    
    def test_error_handling(self):
        """Test error conditions and recovery"""
        assert False, "Not implemented - add error scenario tests"
    
    def test_data_persistence(self):
        """Test data is properly stored and retrieved"""
        assert False, "Not implemented - add data persistence tests"

# Task traceability metadata
TASK_METADATA = {
    "linked_tasks": ["P1-003", "P1-009"],
    "requirements": ["ER-002", "ER-004"], 
    "test_type": "integration",
    "test_functions": [
        "test_primary_user_story",
        "test_error_handling", 
        "test_data_persistence"
    ]
}
EOF
GENERATED_TESTS+=("integration/test_feature_integration.py")

# Unit tests
UNIT_TEST="$TEST_DIR/unit/test_core_components.py"
cat > "$UNIT_TEST" << 'EOF'
"""
Unit tests for core components
Linked to: P1-004, P1-005, P1-006, P1-007
Requirements: ER-003, ER-005 (from epic.md)

This test file validates individual component functionality.
Each test function should reference its linked task ID.
"""
import pytest

class TestCoreComponents:
    """Test individual component functionality"""
    
    def test_component_initialization(self):
        """Test component can be created properly"""
        assert False, "Not implemented - add component tests"
    
    def test_component_methods(self):
        """Test component methods work correctly"""
        assert False, "Not implemented - add method tests"
    
    def test_component_edge_cases(self):
        """Test component handles edge cases"""
        assert False, "Not implemented - add edge case tests"

# Task traceability metadata
TASK_METADATA = {
    "linked_tasks": ["P1-004", "P1-005", "P1-006", "P1-007"],
    "requirements": ["ER-003", "ER-005"],
    "test_type": "unit", 
    "test_functions": [
        "test_component_initialization",
        "test_component_methods",
        "test_component_edge_cases"
    ]
}
EOF
GENERATED_TESTS+=("unit/test_core_components.py")

# Create test configuration if it doesn't exist
if [[ ! -f "$REPO_ROOT/pytest.ini" ]]; then
    cat > "$REPO_ROOT/pytest.ini" << 'EOF'
[tool:pytest]
testpaths = test
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
EOF
fi

if $JSON_MODE; then
    # Convert GENERATED_TESTS array to JSON
    json_tests=$(printf '"%s",' "${GENERATED_TESTS[@]}")
    json_tests="[${json_tests%,}]"
    printf '{"TEST_DIR":"%s","BREAKDOWN_FILE":"%s","TASKS_FILE":"%s","EPIC_FILE":"%s","GENERATED_TESTS":%s,"TEST_PLAN":"%s"}\n' \
        "$TEST_DIR" "$BREAKDOWN_FILE" "$TASKS_FILE" "$EPIC_FILE" "$json_tests" "$TEST_PLAN_FILE"
else
    echo "TEST_DIR: $TEST_DIR"
    echo "BREAKDOWN_FILE: $BREAKDOWN_FILE"
    echo "TASKS_FILE: $TASKS_FILE" 
    echo "EPIC_FILE: $EPIC_FILE"
    echo "GENERATED_TESTS: ${GENERATED_TESTS[*]}"
    echo "TEST_PLAN: $TEST_PLAN_FILE"
fi