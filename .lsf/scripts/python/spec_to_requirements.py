#!/usr/bin/env python3
"""
Layer 1 to Layer 2 transformation: Human spec to requirements/test cases
Follows Layer 2 derivation instruction from .lsf/memory/
"""

import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class UserOutcome:
    """Represents a user outcome from human spec"""
    id: str
    description: str
    success_criteria: List[str]
    constraints: List[str]


@dataclass
class Requirement:
    """Agent-optimized requirement format"""
    id: str
    outcome_id: str
    constraint: str
    component: str
    acceptance: str


@dataclass
class TestCase:
    """Agent-optimized test case format"""
    id: str
    requirement_id: str
    outcome_id: str
    test_type: str
    input_data: str
    expected_output: str
    verify_command: str


class SpecToRequirementsTransformer:
    """Transform human spec to requirements following constitutional principles"""

    def __init__(self, spec_path: str, architecture_boundaries_path: str = ".lsf/memory/architecture-boundaries.md"):
        self.spec_path = Path(spec_path)
        self.boundaries_path = Path(architecture_boundaries_path)
        self.spec_content = self._read_file(self.spec_path)
        self.boundaries = self._read_file(self.boundaries_path) if self.boundaries_path.exists() else ""

    def _read_file(self, path: Path) -> str:
        """Read file content"""
        return path.read_text(encoding='utf-8')

    def parse_outcomes(self) -> List[UserOutcome]:
        """Extract user outcomes from human spec"""
        outcomes = []

        # Pattern for user outcomes
        outcome_pattern = r'OUT-(\d+): (.*?)\n- Success Criteria:(.*?)(?=\n(?:OUT-\d+:|Constraints:|$))'
        matches = re.findall(outcome_pattern, self.spec_content, re.DOTALL)

        for match in matches:
            outcome_id = f"OUT-{match[0]}"
            description = match[1].strip()
            criteria = [c.strip() for c in match[2].strip().split('\n') if c.strip()]

            # Extract constraints if present
            constraints_pattern = f'Constraints:.*?(?=OUT-|$)'
            constraints_match = re.search(constraints_pattern, self.spec_content, re.DOTALL)
            constraints = []
            if constraints_match:
                constraints = [c.strip() for c in constraints_match.group().split('\n')[1:] if c.strip()]

            outcomes.append(UserOutcome(
                id=outcome_id,
                description=description,
                success_criteria=criteria,
                constraints=constraints
            ))

        return outcomes

    def select_component(self, requirement_type: str) -> str:
        """Select component following architecture boundaries decision tree"""
        # Decision tree from architecture-boundaries.md
        component_map = {
            'authentication': 'Django auth (django.contrib.auth)',
            'api': 'Django @api_view decorator',
            'model': 'Django ORM (models.Model)',
            'task': 'Celery @shared_task',
            'validation': 'Django forms (forms.Form)',
            'ui': 'React functional component',
            'state': 'useState/useContext hooks',
            'routing': 'React Router',
            'http': 'Axios client',
            'form': 'React controlled components',
            'style': 'CSS modules'
        }

        # Detect requirement type and return appropriate component
        req_lower = requirement_type.lower()
        for key, component in component_map.items():
            if key in req_lower:
                return component

        # Default based on stack
        if 'frontend' in req_lower or 'ui' in req_lower:
            return 'React functional component'
        else:
            return 'Django @api_view decorator'

    def derive_requirements(self, outcomes: List[UserOutcome]) -> List[Requirement]:
        """Derive minimal requirements from outcomes"""
        requirements = []
        req_counter = 1

        for outcome in outcomes:
            # Generate minimal requirements for each success criterion
            for criterion in outcome.success_criteria:
                # Detect requirement type from criterion
                component = self.select_component(criterion)

                # Create requirement with traceability
                req = Requirement(
                    id=f"REQ-{req_counter:03d}",
                    outcome_id=outcome.id,
                    constraint=self._simplify_constraint(criterion),
                    component=component,
                    acceptance=self._derive_acceptance(criterion)
                )
                requirements.append(req)
                req_counter += 1

        return requirements

    def _simplify_constraint(self, criterion: str) -> str:
        """Simplify criterion to minimal constraint (Minimalism principle)"""
        # Remove unnecessary words, focus on core functionality
        simplified = re.sub(r'\b(should|must|will|shall)\b', '', criterion, flags=re.IGNORECASE)
        simplified = simplified.strip().capitalize()
        return simplified if len(simplified) < 100 else simplified[:97] + '...'

    def _derive_acceptance(self, criterion: str) -> str:
        """Derive minimal acceptance criteria"""
        if 'display' in criterion.lower() or 'show' in criterion.lower():
            return 'UI element renders with data'
        elif 'create' in criterion.lower() or 'add' in criterion.lower():
            return 'Returns ID when created'
        elif 'update' in criterion.lower() or 'edit' in criterion.lower():
            return 'Returns success status'
        elif 'delete' in criterion.lower() or 'remove' in criterion.lower():
            return 'Returns confirmation'
        elif 'validate' in criterion.lower():
            return 'Returns valid/invalid with errors'
        else:
            return 'Operation completes successfully'

    def derive_test_cases(self, requirements: List[Requirement]) -> List[TestCase]:
        """Derive test cases from requirements"""
        test_cases = []
        test_counter = 1

        for req in requirements:
            # Determine test type based on component
            if 'Django' in req.component:
                test_type = 'Backend Integration'
                verify_cmd = f'pytest tests/integration/test_feature.py::test_{test_counter}'
            elif 'React' in req.component:
                test_type = 'Frontend Integration'
                verify_cmd = f'npm test -- Feature.test.tsx'
            elif 'Celery' in req.component:
                test_type = 'Backend Integration'
                verify_cmd = f'pytest tests/integration/test_tasks.py::test_{test_counter}'
            else:
                test_type = 'Integration'
                verify_cmd = f'pytest tests/integration/test_{test_counter}.py'

            # Create test case
            test = TestCase(
                id=f"TEST-{test_counter:03d}",
                requirement_id=req.id,
                outcome_id=req.outcome_id,
                test_type=test_type,
                input_data=self._generate_test_input(req),
                expected_output=req.acceptance,
                verify_command=verify_cmd
            )
            test_cases.append(test)
            test_counter += 1

        return test_cases

    def _generate_test_input(self, req: Requirement) -> str:
        """Generate minimal test input based on requirement"""
        if 'api' in req.component.lower():
            return 'POST /api/resource/ {"name": "Test"}'
        elif 'model' in req.component.lower():
            return 'Model.objects.create(name="Test")'
        elif 'React' in req.component:
            return '<Component id={1} />'
        else:
            return 'Standard test input'

    def generate_requirements_file(self, requirements: List[Requirement]) -> str:
        """Generate requirements.md content"""
        content = ["# Requirements", "", "## Derived Requirements", ""]

        for req in requirements:
            content.extend([
                f"{req.id}: [{req.outcome_id}]",
                f"- Constraint: {req.constraint}",
                f"- Component: {req.component}",
                f"- Acceptance: {req.acceptance}",
                ""
            ])

        content.extend([
            "## Validation Checklist",
            "",
            "- [ ] All requirements traced to user outcomes",
            "- [ ] All components from architecture-boundaries.md",
            "- [ ] No custom implementations required",
            "- [ ] Minimal scope per requirement",
            ""
        ])

        return "\n".join(content)

    def generate_test_cases_file(self, test_cases: List[TestCase]) -> str:
        """Generate test-cases.md content"""
        content = ["# Test Cases", "", "## Derived Test Cases", ""]

        for test in test_cases:
            content.extend([
                f"{test.id}: [{test.requirement_id}→{test.outcome_id}]",
                f"- Type: {test.test_type}",
                f"- Input: {test.input_data}",
                f"- Expected: {test.expected_output}",
                f"- Verify: `{test.verify_command}`",
                ""
            ])

        content.extend([
            "## Coverage Checklist",
            "",
            "- [ ] All requirements have test cases",
            "- [ ] All test types appropriate for stack",
            "- [ ] All verification commands executable",
            "- [ ] Traceability chain complete",
            ""
        ])

        return "\n".join(content)

    def transform(self) -> Tuple[str, str]:
        """Execute full transformation"""
        # Parse outcomes
        outcomes = self.parse_outcomes()

        # Derive requirements
        requirements = self.derive_requirements(outcomes)

        # Derive test cases
        test_cases = self.derive_test_cases(requirements)

        # Generate files
        requirements_content = self.generate_requirements_file(requirements)
        test_cases_content = self.generate_test_cases_file(test_cases)

        return requirements_content, test_cases_content


def main():
    """CLI interface"""
    if len(sys.argv) < 2:
        print("Usage: python spec_to_requirements.py <human-spec.md> [--output-dir DIR]")
        sys.exit(1)

    spec_file = sys.argv[1]
    output_dir = Path(".")

    if "--output-dir" in sys.argv:
        idx = sys.argv.index("--output-dir")
        if idx + 1 < len(sys.argv):
            output_dir = Path(sys.argv[idx + 1])

    try:
        transformer = SpecToRequirementsTransformer(spec_file)
        requirements_content, test_cases_content = transformer.transform()

        # Write output files
        requirements_path = output_dir / "requirements.md"
        test_cases_path = output_dir / "test-cases.md"

        requirements_path.write_text(requirements_content, encoding='utf-8')
        test_cases_path.write_text(test_cases_content, encoding='utf-8')

        print(f"✅ Generated: {requirements_path}")
        print(f"✅ Generated: {test_cases_path}")

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()