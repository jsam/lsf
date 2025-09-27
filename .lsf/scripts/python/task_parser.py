#!/usr/bin/env python3
"""
Task parsing utilities for TDD phase execution
Extracts and validates task definitions from markdown files
"""

import re
import json
import sys
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Any
from pathlib import Path


@dataclass
class RedSetupTask:
    """RED-SETUP task definition"""
    id: str
    description: str
    purpose: str
    dependencies: str
    configuration: str
    verify_command: str


@dataclass
class RedTestTask:
    """RED test task definition"""
    id: str
    test_id: str
    traceability: str
    test_type: str
    file_location: str
    function_name: str
    expected_failure: str
    verify_command: str


@dataclass
class GreenImplementationTask:
    """GREEN implementation task definition"""
    id: str
    requirement_id: str
    red_task_id: str
    traceability: str
    component: str
    file_location: str
    implementation: str
    configuration: str
    verify_command: str


@dataclass
class GreenIntegrationTask:
    """GREEN integration task definition"""
    id: str
    component1: str
    component2: str
    purpose: str
    configuration: str
    dependencies: str
    verify_command: str


@dataclass
class GreenConfigTask:
    """GREEN configuration task definition"""
    id: str
    description: str
    purpose: str
    commands: str
    dependencies: str
    verify_command: str


@dataclass
class GreenSkipTask:
    """GREEN skip task definition"""
    id: str
    requirement_id: str
    reason: str
    component: str
    verification: str
    verify_command: str


@dataclass
class GreenReviewTask:
    """GREEN review task definition"""
    id: str
    requirement_id: str
    reason: str
    analysis: str
    recommendation: str
    status: str


class TaskParser:
    """Parser for extracting tasks from TDD phase markdown files"""

    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.content = self._read_file()

    def _read_file(self) -> str:
        """Read and return file content"""
        try:
            return self.file_path.read_text(encoding='utf-8')
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.file_path}")
        except Exception as e:
            raise Exception(f"Error reading file {self.file_path}: {e}")

    def parse_red_tasks(self) -> Dict[str, List[Any]]:
        """Parse RED phase tasks from markdown content"""
        setup_tasks = self._parse_red_setup_tasks()
        test_tasks = self._parse_red_test_tasks()

        return {
            'setup_tasks': setup_tasks,
            'test_tasks': test_tasks
        }

    def _parse_red_setup_tasks(self) -> List[RedSetupTask]:
        """Extract RED-SETUP tasks"""
        pattern = r'RED-SETUP-(\d+): (.*?)\n- Purpose: (.*?)\n- Dependencies: (.*?)\n- Configuration: (.*?)\n- Verify Setup: `(.*?)`'
        matches = re.findall(pattern, self.content, re.DOTALL)

        tasks = []
        for match in matches:
            task = RedSetupTask(
                id=match[0],
                description=match[1].strip(),
                purpose=match[2].strip(),
                dependencies=match[3].strip(),
                configuration=match[4].strip(),
                verify_command=match[5].strip()
            )
            tasks.append(task)

        return tasks

    def _parse_red_test_tasks(self) -> List[RedTestTask]:
        """Extract RED test tasks"""
        pattern = r'RED-(\d+): Write failing test \[(.*?)\]\n- Traceability: (.*?)\n- Test Type: (.*?)\n- File Location: (.*?)\n- Function Name: (.*?)\n- Expected Failure: (.*?)\n- Verify Failure: `(.*?)`'
        matches = re.findall(pattern, self.content, re.DOTALL)

        tasks = []
        for match in matches:
            task = RedTestTask(
                id=match[0],
                test_id=match[1].strip(),
                traceability=match[2].strip(),
                test_type=match[3].strip(),
                file_location=match[4].strip(),
                function_name=match[5].strip(),
                expected_failure=match[6].strip(),
                verify_command=match[7].strip()
            )
            tasks.append(task)

        return tasks

    def parse_green_tasks(self) -> Dict[str, List[Any]]:
        """Parse GREEN phase tasks from markdown content"""
        impl_tasks = self._parse_green_implementation_tasks()
        int_tasks = self._parse_green_integration_tasks()
        config_tasks = self._parse_green_config_tasks()
        skip_tasks = self._parse_green_skip_tasks()
        review_tasks = self._parse_green_review_tasks()

        return {
            'implementation_tasks': impl_tasks,
            'integration_tasks': int_tasks,
            'config_tasks': config_tasks,
            'skip_tasks': skip_tasks,
            'review_tasks': review_tasks
        }

    def _parse_green_implementation_tasks(self) -> List[GreenImplementationTask]:
        """Extract GREEN implementation tasks"""
        pattern = r'GREEN-(\d+): Implement \[(.*?)\] to pass \[(.*?)\]\n- Traceability: (.*?)\n- Component: (.*?)\n- File Location: (.*?)\n- Implementation: (.*?)\n- Configuration: (.*?)\n- Verify Pass: `(.*?)`'
        matches = re.findall(pattern, self.content, re.DOTALL)

        tasks = []
        for match in matches:
            task = GreenImplementationTask(
                id=match[0],
                requirement_id=match[1].strip(),
                red_task_id=match[2].strip(),
                traceability=match[3].strip(),
                component=match[4].strip(),
                file_location=match[5].strip(),
                implementation=match[6].strip(),
                configuration=match[7].strip(),
                verify_command=match[8].strip()
            )
            tasks.append(task)

        return tasks

    def _parse_green_integration_tasks(self) -> List[GreenIntegrationTask]:
        """Extract GREEN integration tasks"""
        pattern = r'GREEN-INT-(\d+): Integrate (.*?) with (.*?)\n- Purpose: (.*?)\n- Configuration: (.*?)\n- Dependencies: (.*?)\n- Verify Integration: `(.*?)`'
        matches = re.findall(pattern, self.content, re.DOTALL)

        tasks = []
        for match in matches:
            task = GreenIntegrationTask(
                id=match[0],
                component1=match[1].strip(),
                component2=match[2].strip(),
                purpose=match[3].strip(),
                configuration=match[4].strip(),
                dependencies=match[5].strip(),
                verify_command=match[6].strip()
            )
            tasks.append(task)

        return tasks

    def _parse_green_config_tasks(self) -> List[GreenConfigTask]:
        """Extract GREEN config tasks"""
        pattern = r'GREEN-CONFIG-(\d+): Configure (.*?)\n- Purpose: (.*?)\n- Commands: `(.*?)`\n- Dependencies: (.*?)\n- Verify: `(.*?)`'
        matches = re.findall(pattern, self.content, re.DOTALL)

        tasks = []
        for match in matches:
            task = GreenConfigTask(
                id=match[0],
                description=match[1].strip(),
                purpose=match[2].strip(),
                commands=match[3].strip(),
                dependencies=match[4].strip(),
                verify_command=match[5].strip()
            )
            tasks.append(task)

        return tasks

    def _parse_green_skip_tasks(self) -> List[GreenSkipTask]:
        """Extract GREEN skip tasks"""
        pattern = r'GREEN-SKIP-(\d+): Verify existing implementation for \[(.*?)\]\n- Reason: (.*?)\n- Component: (.*?)\n- Verification: (.*?)\n- Verify: `(.*?)`'
        matches = re.findall(pattern, self.content, re.DOTALL)

        tasks = []
        for match in matches:
            task = GreenSkipTask(
                id=match[0],
                requirement_id=match[1].strip(),
                reason=match[2].strip(),
                component=match[3].strip(),
                verification=match[4].strip(),
                verify_command=match[5].strip()
            )
            tasks.append(task)

        return tasks

    def _parse_green_review_tasks(self) -> List[GreenReviewTask]:
        """Extract GREEN review tasks"""
        pattern = r'GREEN-REVIEW-(\d+): Review requirement \[(.*?)\] for implementation\n- Reason: (.*?)\n- Analysis: (.*?)\n- Recommendation: (.*?)\n- Status: (.*?)'
        matches = re.findall(pattern, self.content, re.DOTALL)

        tasks = []
        for match in matches:
            task = GreenReviewTask(
                id=match[0],
                requirement_id=match[1].strip(),
                reason=match[2].strip(),
                analysis=match[3].strip(),
                recommendation=match[4].strip(),
                status=match[5].strip()
            )
            tasks.append(task)

        return tasks

    def validate_traceability(self) -> List[str]:
        """Validate traceability chains in tasks"""
        errors = []

        # Parse both RED and GREEN tasks
        red_tasks = self.parse_red_tasks()
        green_tasks = self.parse_green_tasks()

        # Extract traceability patterns
        traceability_pattern = r'\[(.*?)\]'

        # Validate RED task traceability
        for task in red_tasks['test_tasks']:
            trace_matches = re.findall(traceability_pattern, task.traceability)
            if len(trace_matches) < 3:  # Should have TEST → REQ → OUT
                errors.append(f"RED-{task.id}: Incomplete traceability chain")

        # Validate GREEN task traceability
        for task in green_tasks['implementation_tasks']:
            trace_matches = re.findall(traceability_pattern, task.traceability)
            if len(trace_matches) < 3:  # Should have RED → REQ → OUT
                errors.append(f"GREEN-{task.id}: Incomplete traceability chain")

        return errors

    def validate_component_boundaries(self, boundaries_file: str) -> List[str]:
        """Validate that all components exist in architecture boundaries"""
        errors = []

        try:
            boundaries_content = Path(boundaries_file).read_text(encoding='utf-8')
        except FileNotFoundError:
            return [f"Architecture boundaries file not found: {boundaries_file}"]

        # Parse GREEN implementation tasks for component validation
        green_tasks = self.parse_green_tasks()

        for task in green_tasks['implementation_tasks']:
            component = task.component
            # Check if component is mentioned in boundaries file
            if component not in boundaries_content:
                errors.append(f"GREEN-{task.id}: Component '{component}' not found in architecture boundaries")

        return errors

    def get_task_execution_order(self) -> List[str]:
        """Determine optimal task execution order based on dependencies"""
        red_tasks = self.parse_red_tasks()
        green_tasks = self.parse_green_tasks()

        execution_order = []

        # RED phase: setup tasks first, then test tasks
        for task in red_tasks['setup_tasks']:
            execution_order.append(f"RED-SETUP-{task.id}")

        for task in red_tasks['test_tasks']:
            execution_order.append(f"RED-{task.id}")

        # GREEN phase: implementation, config, then integration
        for task in green_tasks['implementation_tasks']:
            execution_order.append(f"GREEN-{task.id}")

        for task in green_tasks['config_tasks']:
            execution_order.append(f"GREEN-CONFIG-{task.id}")

        for task in green_tasks['integration_tasks']:
            execution_order.append(f"GREEN-INT-{task.id}")

        # Skip and review tasks can be processed at any time
        for task in green_tasks['skip_tasks']:
            execution_order.append(f"GREEN-SKIP-{task.id}")

        for task in green_tasks['review_tasks']:
            execution_order.append(f"GREEN-REVIEW-{task.id}")

        return execution_order

    def export_json(self, output_file: Optional[str] = None) -> str:
        """Export parsed tasks to JSON format"""
        if self.file_path.name.startswith('red'):
            tasks = self.parse_red_tasks()
        elif self.file_path.name.startswith('green'):
            tasks = self.parse_green_tasks()
        else:
            # Try to parse both
            red_tasks = self.parse_red_tasks()
            green_tasks = self.parse_green_tasks()
            tasks = {'red': red_tasks, 'green': green_tasks}

        # Convert dataclasses to dictionaries
        def convert_tasks(task_dict):
            result = {}
            for key, task_list in task_dict.items():
                result[key] = [asdict(task) for task in task_list]
            return result

        if 'red' in tasks and 'green' in tasks:
            json_data = {
                'red': convert_tasks(tasks['red']),
                'green': convert_tasks(tasks['green'])
            }
        else:
            json_data = convert_tasks(tasks)

        json_output = json.dumps(json_data, indent=2)

        if output_file:
            Path(output_file).write_text(json_output, encoding='utf-8')

        return json_output


def main():
    """CLI interface for task parser"""
    if len(sys.argv) < 2:
        print("Usage: python task_parser.py <phase-file.md> [--json] [--validate] [--order]")
        print("\nOptions:")
        print("  --json        Export tasks to JSON format")
        print("  --validate    Validate traceability and components")
        print("  --order       Show task execution order")
        print("  --boundaries  Path to architecture boundaries file (for validation)")
        sys.exit(1)

    file_path = sys.argv[1]
    options = sys.argv[2:]

    try:
        parser = TaskParser(file_path)

        if '--json' in options:
            json_output = parser.export_json()
            print(json_output)

        elif '--validate' in options:
            # Validate traceability
            trace_errors = parser.validate_traceability()
            if trace_errors:
                print("Traceability validation errors:")
                for error in trace_errors:
                    print(f"  - {error}")
            else:
                print("✅ Traceability validation passed")

            # Validate component boundaries if file provided
            if '--boundaries' in options:
                boundaries_idx = options.index('--boundaries')
                if boundaries_idx + 1 < len(options):
                    boundaries_file = options[boundaries_idx + 1]
                    boundary_errors = parser.validate_component_boundaries(boundaries_file)
                    if boundary_errors:
                        print("\nComponent boundary validation errors:")
                        for error in boundary_errors:
                            print(f"  - {error}")
                    else:
                        print("✅ Component boundary validation passed")

        elif '--order' in options:
            execution_order = parser.get_task_execution_order()
            print("Task execution order:")
            for i, task_id in enumerate(execution_order, 1):
                print(f"  {i}. {task_id}")

        else:
            # Default: parse and show summary
            if 'red' in file_path.lower():
                tasks = parser.parse_red_tasks()
                print(f"RED phase tasks in {file_path}:")
                print(f"  Setup tasks: {len(tasks['setup_tasks'])}")
                print(f"  Test tasks: {len(tasks['test_tasks'])}")
            elif 'green' in file_path.lower():
                tasks = parser.parse_green_tasks()
                print(f"GREEN phase tasks in {file_path}:")
                print(f"  Implementation tasks: {len(tasks['implementation_tasks'])}")
                print(f"  Integration tasks: {len(tasks['integration_tasks'])}")
                print(f"  Config tasks: {len(tasks['config_tasks'])}")
                print(f"  Skip tasks: {len(tasks['skip_tasks'])}")
                print(f"  Review tasks: {len(tasks['review_tasks'])}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()