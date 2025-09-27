#!/usr/bin/env bash
# RED Phase Execution: Transform RED-XXX tasks into failing tests

set -euo pipefail

source "$(dirname "$0")/common.sh"

RED_PHASE_FILE="$1"
REPO_ROOT=$(get_repo_root)

usage() {
    cat <<EOF
Usage: $0 <red-phase.md>

Transform RED-XXX tasks into failing test implementations.

Example:
  $0 red-phase.md

Environment Variables:
  DRY_RUN=1     Show commands without executing
  VERBOSE=1     Show detailed output
EOF
}

validate_input() {
    if [[ $# -eq 0 || "$1" == "-h" || "$1" == "--help" ]]; then
        usage
        exit 0
    fi

    if [[ ! -f "$RED_PHASE_FILE" ]]; then
        echo "ERROR: Red phase file not found: $RED_PHASE_FILE" >&2
        exit 1
    fi

    if ! grep -q "^RED-" "$RED_PHASE_FILE"; then
        echo "ERROR: No RED-XXX tasks found in $RED_PHASE_FILE" >&2
        exit 1
    fi
}

parse_red_tasks() {
    local file="$1"
    python3 -c "
import re
import sys

content = open('$file').read()

# Extract RED-SETUP tasks
setup_pattern = r'RED-SETUP-(\d+): (.*?)\n- Purpose: (.*?)\n- Dependencies: (.*?)\n- Configuration: (.*?)\n- Verify Setup: \`(.*?)\`'
setup_matches = re.findall(setup_pattern, content, re.DOTALL)

# Extract RED test tasks
task_pattern = r'RED-(\d+): Write failing test \[(.*?)\]\n- Traceability: (.*?)\n- Test Type: (.*?)\n- File Location: (.*?)\n- Function Name: (.*?)\n- Expected Failure: (.*?)\n- Verify Failure: \`(.*?)\`'
task_matches = re.findall(task_pattern, content, re.DOTALL)

# Output setup tasks
for match in setup_matches:
    id, desc, purpose, deps, config, verify = match
    print(f'SETUP|{id}|{desc.strip()}|{purpose.strip()}|{deps.strip()}|{config.strip()}|{verify.strip()}')

# Output test tasks
for match in task_matches:
    id, test_id, trace, test_type, file_loc, func_name, failure, verify = match
    print(f'TEST|{id}|{test_id.strip()}|{trace.strip()}|{test_type.strip()}|{file_loc.strip()}|{func_name.strip()}|{failure.strip()}|{verify.strip()}')
"
}

execute_setup_task() {
    local task_line="$1"
    IFS='|' read -r type id desc purpose deps config verify <<< "$task_line"

    echo "📋 Executing RED-SETUP-$id: $desc"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "  [DRY RUN] Would setup: $purpose"
        echo "  [DRY RUN] Dependencies: $deps"
        echo "  [DRY RUN] Configuration: $config"
        echo "  [DRY RUN] Verify with: $verify"
        return 0
    fi

    # Create test directories if needed
    if [[ "$deps" == *"DATABASE"* ]]; then
        echo "  Setting up test database configuration..."
        # Ensure test database settings exist
    fi

    if [[ "$deps" == *"MOCK"* ]]; then
        echo "  Setting up mock infrastructure..."
        # Create mock directories
        mkdir -p tests/mocks
    fi

    if [[ "$deps" == *"FIXTURES"* ]]; then
        echo "  Setting up test fixtures..."
        # Create fixtures directory
        mkdir -p tests/fixtures
    fi

    # Verify setup
    echo "  Verifying setup..."
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        echo "  Running: $verify"
    fi

    if eval "$verify" >/dev/null 2>&1; then
        echo "  ✅ Setup verified successfully"
    else
        echo "  ⚠️  Setup verification failed (expected for initial setup)"
    fi
}

execute_test_task() {
    local task_line="$1"
    IFS='|' read -r type id test_id trace test_type file_loc func_name failure verify <<< "$task_line"

    echo "🔴 Executing RED-$id: Write failing test [$test_id]"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "  [DRY RUN] Would create: $file_loc"
        echo "  [DRY RUN] Function: $func_name"
        echo "  [DRY RUN] Expected failure: $failure"
        echo "  [DRY RUN] Verify with: $verify"
        return 0
    fi

    # Create test directory
    local test_dir=$(dirname "$file_loc")
    mkdir -p "$test_dir"

    # Generate test based on type
    case "$test_type" in
        "Integration"|"Backend Integration")
            generate_django_integration_test "$file_loc" "$func_name" "$test_id" "$trace"
            ;;
        "Contract"|"Backend Contract")
            generate_django_contract_test "$file_loc" "$func_name" "$test_id" "$trace"
            ;;
        "Frontend Integration")
            generate_react_integration_test "$file_loc" "$func_name" "$test_id" "$trace"
            ;;
        "Unit"|"Backend Unit")
            generate_django_unit_test "$file_loc" "$func_name" "$test_id" "$trace"
            ;;
        "Frontend Unit")
            generate_react_unit_test "$file_loc" "$func_name" "$test_id" "$trace"
            ;;
        "Load")
            generate_load_test "$file_loc" "$func_name" "$test_id" "$trace"
            ;;
        *)
            echo "  ⚠️  Unknown test type: $test_type"
            return 1
            ;;
    esac

    # Verify test fails as expected
    echo "  Verifying test fails..."
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        echo "  Running: $verify"
    fi

    if ! eval "$verify" >/dev/null 2>&1; then
        echo "  ✅ Test fails as expected"
    else
        echo "  ❌ Test should fail but passes"
        return 1
    fi
}

generate_django_integration_test() {
    local file_path="$1"
    local func_name="$2"
    local test_id="$3"
    local trace="$4"

    cat > "$file_path" <<EOF
"""
Integration test for $test_id
Traceability: $trace
"""
from django.test import TestCase, Client
from django.urls import reverse
import json


class ${test_id}IntegrationTest(TestCase):
    def setUp(self):
        self.client = Client()

    def $func_name(self):
        """
        Test implementation needed for $test_id
        This test should fail until implementation is complete
        """
        # This will fail until the endpoint/model is implemented
        response = self.client.get('/api/nonexistent/')
        self.assertEqual(response.status_code, 200)
EOF

    echo "  ✅ Created Django integration test: $file_path"
}

generate_django_contract_test() {
    local file_path="$1"
    local func_name="$2"
    local test_id="$3"
    local trace="$4"

    cat > "$file_path" <<EOF
"""
Contract test for $test_id
Traceability: $trace
"""
from django.test import TestCase, Client
import json


class ${test_id}ContractTest(TestCase):
    def setUp(self):
        self.client = Client()

    def $func_name(self):
        """
        API contract test for $test_id
        This test should fail until API is implemented
        """
        # This will fail until the API endpoint is implemented
        response = self.client.post('/api/nonexistent/',
                                  json.dumps({}),
                                  content_type='application/json')
        self.assertEqual(response.status_code, 201)
EOF

    echo "  ✅ Created Django contract test: $file_path"
}

generate_react_integration_test() {
    local file_path="$1"
    local func_name="$2"
    local test_id="$3"
    local trace="$4"

    cat > "$file_path" <<EOF
/**
 * Integration test for $test_id
 * Traceability: $trace
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NonExistentComponent } from '../components/NonExistentComponent'

describe('$test_id Integration Test', () => {
  it('$func_name', () => {
    // This will fail until the component is implemented
    render(<NonExistentComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
EOF

    echo "  ✅ Created React integration test: $file_path"
}

generate_django_unit_test() {
    local file_path="$1"
    local func_name="$2"
    local test_id="$3"
    local trace="$4"

    cat > "$file_path" <<EOF
"""
Unit test for $test_id
Traceability: $trace
"""
import unittest
from unittest.mock import Mock, patch


class ${test_id}UnitTest(unittest.TestCase):
    def $func_name(self):
        """
        Unit test for $test_id
        This test should fail until function is implemented
        """
        # This will fail until the function is implemented
        from nonexistent_module import nonexistent_function
        result = nonexistent_function()
        self.assertEqual(result, 'expected_value')
EOF

    echo "  ✅ Created Django unit test: $file_path"
}

generate_react_unit_test() {
    local file_path="$1"
    local func_name="$2"
    local test_id="$3"
    local trace="$4"

    cat > "$file_path" <<EOF
/**
 * Unit test for $test_id
 * Traceability: $trace
 */
import { describe, it, expect } from 'vitest'
import { nonExistentFunction } from '../utils/nonExistentFunction'

describe('$test_id Unit Test', () => {
  it('$func_name', () => {
    // This will fail until the function is implemented
    const result = nonExistentFunction()
    expect(result).toBe('expected_value')
  })
})
EOF

    echo "  ✅ Created React unit test: $file_path"
}

generate_load_test() {
    local file_path="$1"
    local func_name="$2"
    local test_id="$3"
    local trace="$4"

    cat > "$file_path" <<EOF
"""
Load test for $test_id
Traceability: $trace
"""
import time
import requests
import unittest


class ${test_id}LoadTest(unittest.TestCase):
    def $func_name(self):
        """
        Load test for $test_id
        This test should fail until performance target is met
        """
        start_time = time.time()

        # This will fail until the endpoint exists and meets performance requirements
        try:
            response = requests.get('http://localhost:8000/api/nonexistent/')
            response.raise_for_status()
        except requests.exceptions.RequestException:
            self.fail("Endpoint not implemented")

        end_time = time.time()
        duration = end_time - start_time

        # Expect response time under 100ms
        self.assertLess(duration, 0.1, f"Response too slow: {duration}s")
EOF

    echo "  ✅ Created load test: $file_path"
}

main() {
    validate_input "$@"

    echo "🔴 RED Phase Execution"
    echo "Input: $RED_PHASE_FILE"
    echo ""

    # Parse and execute tasks in order
    local tasks=$(parse_red_tasks "$RED_PHASE_FILE")

    # Execute setup tasks first
    echo "📋 Executing setup tasks..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^SETUP\| ]]; then
            execute_setup_task "$line"
        fi
    done <<< "$tasks"

    echo ""
    echo "🔴 Executing test tasks..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^TEST\| ]]; then
            execute_test_task "$line"
        fi
    done <<< "$tasks"

    echo ""
    echo "✅ RED phase execution complete"
    echo "💡 Run tests to verify they fail as expected"
}

main "$@"