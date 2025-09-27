#!/usr/bin/env python3
"""
Layer 2 to Layer 3A transformation: Requirements/test cases to red phase
Follows red phase derivation instruction from .lsf/memory/
"""

import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Tuple


@dataclass
class TestCase:
    """Test case from Layer 2"""
    id: str
    requirement_id: str
    outcome_id: str
    test_type: str
    input_data: str
    expected_output: str
    verify_command: str


@dataclass
class RedTask:
    """RED phase task for TDD"""
    id: str
    test_id: str
    traceability: str
    test_type: str
    file_location: str
    function_name: str
    expected_failure: str
    verify_failure: str


@dataclass
class RedSetupTask:
    """RED setup task for infrastructure"""
    id: str
    description: str
    purpose: str
    dependencies: str
    configuration: str
    verify_setup: str


class RequirementsToRedTransformer:
    """Transform requirements to red phase following constitutional principles"""

    def __init__(self, requirements_path: str, test_cases_path: str):
        self.requirements_path = Path(requirements_path)
        self.test_cases_path = Path(test_cases_path)
        self.requirements = self._read_file(self.requirements_path)
        self.test_cases_content = self._read_file(self.test_cases_path)

    def _read_file(self, path: Path) -> str:
        """Read file content"""
        return path.read_text(encoding='utf-8')

    def parse_test_cases(self) -> List[TestCase]:
        """Parse test cases from test-cases.md"""
        test_cases = []

        # Pattern for test cases
        pattern = r'(TEST-\d+): \[(.*?)\]\n- Type: (.*?)\n- Input: (.*?)\n- Expected: (.*?)\n- Verify: `(.*?)`'
        matches = re.findall(pattern, self.test_cases_content, re.MULTILINE)

        for match in matches:
            test_id = match[0]
            trace_parts = match[1].split('→')
            req_id = trace_parts[0] if trace_parts else ''
            outcome_id = trace_parts[1] if len(trace_parts) > 1 else ''

            test_cases.append(TestCase(
                id=test_id,
                requirement_id=req_id,
                outcome_id=outcome_id,
                test_type=match[2].strip(),
                input_data=match[3].strip(),
                expected_output=match[4].strip(),
                verify_command=match[5].strip()
            ))

        return test_cases

    def determine_file_location(self, test_type: str, test_id: str) -> str:
        """Determine test file location based on type and stack"""
        test_num = re.search(r'\d+', test_id).group()

        if 'Backend' in test_type:
            if 'Integration' in test_type:
                return f'tests/integration/test_feature_{test_num}.py'
            elif 'Contract' in test_type:
                return f'tests/contract/test_api_{test_num}.py'
            elif 'Unit' in test_type:
                return f'tests/unit/test_module_{test_num}.py'
            else:
                return f'tests/test_{test_num}.py'
        elif 'Frontend' in test_type:
            if 'Integration' in test_type:
                return f'src/frontend/tests/integration/Feature{test_num}.test.tsx'
            elif 'Unit' in test_type:
                return f'src/frontend/tests/unit/module{test_num}.test.ts'
            else:
                return f'src/frontend/tests/test_{test_num}.tsx'
        elif 'Load' in test_type:
            return f'tests/performance/test_load_{test_num}.py'
        else:
            return f'tests/integration/test_{test_num}.py'

    def determine_function_name(self, test_id: str, test_type: str) -> str:
        """Generate function name for test"""
        test_num = re.search(r'\d+', test_id).group()

        if 'Backend' in test_type or 'Load' in test_type:
            return f'test_scenario_{test_num}()'
        elif 'Frontend' in test_type:
            return f'test_component_{test_num}()'
        else:
            return f'test_case_{test_num}()'

    def determine_expected_failure(self, test_type: str, input_data: str) -> str:
        """Determine expected failure reason"""
        if 'model' in input_data.lower() or 'Model' in input_data:
            return 'ImportError (Model not implemented)'
        elif 'api' in input_data.lower() or '/api/' in input_data:
            return 'URLError (API endpoint not implemented)'
        elif 'Component' in input_data:
            return 'Component not implemented'
        elif 'task' in input_data.lower():
            return 'ImportError (Task not implemented)'
        else:
            return 'Function/Module not implemented'

    def generate_verify_command(self, file_location: str, function_name: str) -> str:
        """Generate verification command for test"""
        func_without_parens = function_name.replace('()', '')

        if file_location.endswith('.py'):
            return f'pytest {file_location}::{func_without_parens} --tb=short'
        elif file_location.endswith(('.tsx', '.ts')):
            filename = Path(file_location).name
            return f'npm test -- {filename}'
        else:
            return f'python {file_location}'

    def create_red_tasks(self, test_cases: List[TestCase]) -> List[RedTask]:
        """Create RED tasks from test cases"""
        red_tasks = []
        task_counter = 1

        for test_case in test_cases:
            file_location = self.determine_file_location(test_case.test_type, test_case.id)
            function_name = self.determine_function_name(test_case.id, test_case.test_type)
            expected_failure = self.determine_expected_failure(test_case.test_type, test_case.input_data)
            verify_command = self.generate_verify_command(file_location, function_name)

            red_task = RedTask(
                id=f"{task_counter:03d}",
                test_id=test_case.id,
                traceability=f"[{test_case.id}→{test_case.requirement_id}→{test_case.outcome_id}]",
                test_type=test_case.test_type,
                file_location=file_location,
                function_name=function_name,
                expected_failure=expected_failure,
                verify_failure=verify_command
            )
            red_tasks.append(red_task)
            task_counter += 1

        return red_tasks

    def create_setup_tasks(self, test_cases: List[TestCase]) -> List[RedSetupTask]:
        """Create infrastructure setup tasks"""
        setup_tasks = []
        needs_database = False
        needs_mocks = False
        needs_frontend = False

        # Analyze what infrastructure is needed
        for test_case in test_cases:
            if 'Backend' in test_case.test_type:
                needs_database = True
            if 'Contract' in test_case.test_type:
                needs_mocks = True
            if 'Frontend' in test_case.test_type:
                needs_frontend = True

        task_counter = 1

        if needs_database:
            setup_tasks.append(RedSetupTask(
                id=f"{task_counter:03d}",
                description="Setup test database for Django",
                purpose="Enable backend integration tests",
                dependencies="DATABASE fixtures, Django test client",
                configuration="DATABASES test settings, migrations",
                verify_setup="pytest tests/integration --collect-only"
            ))
            task_counter += 1

        if needs_mocks:
            setup_tasks.append(RedSetupTask(
                id=f"{task_counter:03d}",
                description="Setup API contract mocks",
                purpose="Enable contract testing",
                dependencies="MOCK libraries, test fixtures",
                configuration="Mock service endpoints",
                verify_setup='python -c "import tests.mocks; print(\'OK\')"'
            ))
            task_counter += 1

        if needs_frontend:
            setup_tasks.append(RedSetupTask(
                id=f"{task_counter:03d}",
                description="Setup React testing environment",
                purpose="Enable frontend testing",
                dependencies="Vitest, Testing Library, jsdom",
                configuration="Vitest config, test setup",
                verify_setup="npm test -- --run"
            ))
            task_counter += 1

        return setup_tasks

    def generate_red_phase_file(self, setup_tasks: List[RedSetupTask], red_tasks: List[RedTask]) -> str:
        """Generate red-phase.md content"""
        content = ["# Red Phase: Failing Test Implementation", ""]

        # Infrastructure setup tasks
        if setup_tasks:
            content.extend(["## Infrastructure Setup Tasks", ""])
            for task in setup_tasks:
                content.extend([
                    f"RED-SETUP-{task.id}: {task.description}",
                    f"- Purpose: {task.purpose}",
                    f"- Dependencies: {task.dependencies}",
                    f"- Configuration: {task.configuration}",
                    f"- Verify Setup: `{task.verify_setup}`",
                    ""
                ])

        # Test implementation tasks
        content.extend(["## Test Implementation Tasks", ""])
        for task in red_tasks:
            content.extend([
                f"RED-{task.id}: Write failing test [{task.test_id}]",
                f"- Traceability: {task.traceability}",
                f"- Test Type: {task.test_type}",
                f"- File Location: {task.file_location}",
                f"- Function Name: {task.function_name}",
                f"- Expected Failure: {task.expected_failure}",
                f"- Verify Failure: `{task.verify_failure}`",
                ""
            ])

        # Validation tasks
        content.extend([
            "## Validation Tasks",
            "",
            "RED-VALIDATE-001: Verify all tests fail as expected",
            "- Command: `pytest tests/ --tb=line | grep FAILED`",
            "- Expected: All RED-XXX tests show FAILED status",
            "- Success: No passing tests in red phase",
            ""
        ])

        return "\n".join(content)

    def transform(self) -> str:
        """Execute full transformation"""
        # Parse test cases
        test_cases = self.parse_test_cases()

        # Create RED tasks
        red_tasks = self.create_red_tasks(test_cases)

        # Create setup tasks
        setup_tasks = self.create_setup_tasks(test_cases)

        # Generate red phase file
        red_phase_content = self.generate_red_phase_file(setup_tasks, red_tasks)

        return red_phase_content


def main():
    """CLI interface"""
    if len(sys.argv) < 3:
        print("Usage: python requirements_to_red.py <requirements.md> <test-cases.md> [--output OUTPUT]")
        sys.exit(1)

    requirements_file = sys.argv[1]
    test_cases_file = sys.argv[2]
    output_file = "red-phase.md"

    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        if idx + 1 < len(sys.argv):
            output_file = sys.argv[idx + 1]

    try:
        transformer = RequirementsToRedTransformer(requirements_file, test_cases_file)
        red_phase_content = transformer.transform()

        # Write output file
        output_path = Path(output_file)
        output_path.write_text(red_phase_content, encoding='utf-8')

        print(f"✅ Generated: {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()