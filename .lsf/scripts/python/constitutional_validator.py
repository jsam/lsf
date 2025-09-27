#!/usr/bin/env python3
"""
Constitutional compliance validator for TDD phase execution
Validates adherence to Agentic Development Principles and software factory constitution
"""

import re
import sys
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass


@dataclass
class ComplianceViolation:
    """Represents a constitutional compliance violation"""
    principle: str
    severity: str  # 'warning', 'error', 'critical'
    location: str
    description: str
    suggestion: str


class ConstitutionalValidator:
    """Validator for constitutional compliance in TDD phases"""

    def __init__(self, constitution_file: str = None):
        self.constitution_file = constitution_file or ".lsf/memory/constitution.md"
        self.constitution_content = self._load_constitution()
        self.violations: List[ComplianceViolation] = []

    def _load_constitution(self) -> str:
        """Load constitution content if available"""
        try:
            return Path(self.constitution_file).read_text(encoding='utf-8')
        except FileNotFoundError:
            return ""

    def validate_file(self, file_path: str) -> List[ComplianceViolation]:
        """Validate a single file for constitutional compliance"""
        self.violations = []
        content = Path(file_path).read_text(encoding='utf-8')

        # Run all validation checks
        self._validate_context_efficiency(content, file_path)
        self._validate_minimalism(content, file_path)
        self._validate_reasonable_defaults(content, file_path)
        self._validate_agent_centric_content(content, file_path)
        self._validate_focus(content, file_path)
        self._validate_boundaries(content, file_path)
        self._validate_drift_detection(content, file_path)
        self._validate_verification(content, file_path)

        return self.violations

    def _add_violation(self, principle: str, severity: str, location: str,
                      description: str, suggestion: str):
        """Add a compliance violation"""
        violation = ComplianceViolation(
            principle=principle,
            severity=severity,
            location=location,
            description=description,
            suggestion=suggestion
        )
        self.violations.append(violation)

    def _validate_context_efficiency(self, content: str, file_path: str):
        """Validate Article 0.1: Context Efficiency"""

        # Check for excessive verbosity in task descriptions
        task_pattern = r'(RED-\d+|GREEN-\d+):\s*(.*?)(?=\n-|\n\n|$)'
        tasks = re.findall(task_pattern, content, re.MULTILINE | re.DOTALL)

        for task_id, description in tasks:
            if len(description.strip()) > 200:
                self._add_violation(
                    principle="Context Efficiency",
                    severity="warning",
                    location=f"{file_path}:{task_id}",
                    description=f"Task description exceeds 200 characters ({len(description.strip())} chars)",
                    suggestion="Shorten task description to essential information only"
                )

        # Check for redundant information
        if content.count("Implementation:") > 20:
            self._add_violation(
                principle="Context Efficiency",
                severity="warning",
                location=file_path,
                description="High number of implementation tasks may indicate context inefficiency",
                suggestion="Consider consolidating related tasks or breaking into smaller phases"
            )

    def _validate_minimalism(self, content: str, file_path: str):
        """Validate Article 0.2: Minimalism"""

        # Count total tasks
        task_count = len(re.findall(r'^(RED-\d+|GREEN-\d+):', content, re.MULTILINE))

        if task_count > 25:
            self._add_violation(
                principle="Minimalism",
                severity="error",
                location=file_path,
                description=f"Excessive task count ({task_count}) indicates complexity creep",
                suggestion="Break down into smaller phases or eliminate non-essential tasks"
            )

        # Check for custom implementations when existing components could work
        custom_indicators = [
            "custom implementation", "new framework", "additional dependency",
            "build from scratch", "create new", "implement custom"
        ]

        for indicator in custom_indicators:
            if indicator.lower() in content.lower():
                matches = re.finditer(re.escape(indicator), content, re.IGNORECASE)
                for match in matches:
                    self._add_violation(
                        principle="Minimalism",
                        severity="error",
                        location=f"{file_path}:line{self._get_line_number(content, match.start())}",
                        description=f"Detected potential custom implementation: '{indicator}'",
                        suggestion="Use existing components from architecture boundaries instead"
                    )

        # Check for over-engineering patterns
        complex_patterns = [
            "abstract factory", "observer pattern", "strategy pattern",
            "microservice", "distributed", "scalable architecture"
        ]

        for pattern in complex_patterns:
            if pattern.lower() in content.lower():
                self._add_violation(
                    principle="Minimalism",
                    severity="warning",
                    location=file_path,
                    description=f"Complex pattern detected: '{pattern}' - may be over-engineering",
                    suggestion="Verify this complexity is required by the actual requirements"
                )

    def _validate_reasonable_defaults(self, content: str, file_path: str):
        """Validate Article 0.3: Reasonable Defaults"""

        # Check for non-standard component usage
        non_standard_patterns = [
            "custom ORM", "custom auth", "custom router", "custom validation",
            "handwritten SQL", "custom serialization"
        ]

        for pattern in non_standard_patterns:
            if pattern.lower() in content.lower():
                self._add_violation(
                    principle="Reasonable Defaults",
                    severity="warning",
                    location=file_path,
                    description=f"Non-standard implementation detected: '{pattern}'",
                    suggestion="Use framework defaults (Django ORM, auth, etc.) when possible"
                )

        # Check for proper framework usage
        if "Django" in content and "models.Model" not in content:
            if "model" in content.lower():
                self._add_violation(
                    principle="Reasonable Defaults",
                    severity="warning",
                    location=file_path,
                    description="Django project not using Django ORM for models",
                    suggestion="Use Django's built-in models.Model for data modeling"
                )

    def _validate_agent_centric_content(self, content: str, file_path: str):
        """Validate Article 0.4: Agent-centric content"""

        # Check for human-oriented language instead of agent-oriented
        human_oriented = [
            "please", "thank you", "we should", "let's", "I think",
            "in my opinion", "feel free", "don't hesitate"
        ]

        for phrase in human_oriented:
            if phrase.lower() in content.lower():
                self._add_violation(
                    principle="Agent-centric Content",
                    severity="warning",
                    location=file_path,
                    description=f"Human-oriented language detected: '{phrase}'",
                    suggestion="Use imperative, agent-focused language (Create, Implement, Configure)"
                )

        # Check for missing traceability (essential for agents)
        task_lines = re.findall(r'^(RED-\d+|GREEN-\d+):.*?$', content, re.MULTILINE)
        traceability_lines = re.findall(r'- Traceability:', content)

        if len(task_lines) > len(traceability_lines):
            self._add_violation(
                principle="Agent-centric Content",
                severity="error",
                location=file_path,
                description="Some tasks missing traceability information",
                suggestion="Add traceability chain to all tasks for agent execution"
            )

    def _validate_focus(self, content: str, file_path: str):
        """Validate Article 0.5: Focus"""

        # Check for non-software-production content
        non_focus_patterns = [
            "business strategy", "market analysis", "stakeholder meeting",
            "user research", "marketing", "sales", "pricing",
            "business case", "ROI analysis", "stakeholder buy-in"
        ]

        for pattern in non_focus_patterns:
            if pattern.lower() in content.lower():
                self._add_violation(
                    principle="Focus",
                    severity="error",
                    location=file_path,
                    description=f"Non-software-production content detected: '{pattern}'",
                    suggestion="Remove business/stakeholder content - focus only on software implementation"
                )

        # Verify all tasks are implementation-focused
        if not re.search(r'(test|implement|configure|integrate)', content, re.IGNORECASE):
            self._add_violation(
                principle="Focus",
                severity="error",
                location=file_path,
                description="Content lacks implementation focus",
                suggestion="Ensure all tasks are about testing, implementing, or configuring software"
            )

    def _validate_boundaries(self, content: str, file_path: str):
        """Validate Article 0.6: Boundaries"""

        # Check for cross-stack violations (Django in frontend, React in backend)
        cross_stack_violations = [
            ("django", "frontend", "Django components in frontend"),
            ("react", "backend", "React components in backend"),
            ("jsx", "django", "JSX in Django code"),
            ("models.py", "react", "Django models in React"),
        ]

        for term1, term2, description in cross_stack_violations:
            if (term1.lower() in content.lower() and term2.lower() in content.lower() and
                "integration" not in content.lower()):
                self._add_violation(
                    principle="Boundaries",
                    severity="error",
                    location=file_path,
                    description=description,
                    suggestion="Maintain clean separation between backend (Django) and frontend (React)"
                )

        # Check for proper test boundaries
        test_mixing_patterns = [
            ("pytest", "vitest", "Mixing Python and JavaScript test frameworks"),
            ("unittest", "jest", "Mixing different test frameworks"),
        ]

        for framework1, framework2, description in test_mixing_patterns:
            if framework1.lower() in content.lower() and framework2.lower() in content.lower():
                self._add_violation(
                    principle="Boundaries",
                    severity="warning",
                    location=file_path,
                    description=description,
                    suggestion="Use pytest for backend, Vitest for frontend consistently"
                )

    def _validate_drift_detection(self, content: str, file_path: str):
        """Validate Article 0.7: Drift Detection"""

        # Check if tasks maintain connection to original requirements
        req_references = len(re.findall(r'REQ-\d+', content))
        task_count = len(re.findall(r'^(RED-\d+|GREEN-\d+):', content, re.MULTILINE))

        if task_count > 0 and req_references == 0:
            self._add_violation(
                principle="Drift Detection",
                severity="error",
                location=file_path,
                description="Tasks not linked to requirements (REQ-XXX)",
                suggestion="Maintain traceability to original requirements to prevent drift"
            )

        # Check for scope creep indicators
        scope_creep_patterns = [
            "while we're at it", "also implement", "might as well",
            "additional feature", "enhance with", "extend to include"
        ]

        for pattern in scope_creep_patterns:
            if pattern.lower() in content.lower():
                self._add_violation(
                    principle="Drift Detection",
                    severity="warning",
                    location=file_path,
                    description=f"Potential scope creep detected: '{pattern}'",
                    suggestion="Stick to original requirements - additional features should be separate phases"
                )

    def _validate_verification(self, content: str, file_path: str):
        """Validate Article 0.8: Verification"""

        # Check that all tasks have verification commands
        tasks = re.findall(r'^(RED-\d+|GREEN-\d+):.*?(?=^(?:RED-\d+|GREEN-\d+|$))',
                          content, re.MULTILINE | re.DOTALL)

        for task in tasks:
            if "Verify" not in task:
                task_id = re.match(r'^(RED-\d+|GREEN-\d+):', task).group(1)
                self._add_violation(
                    principle="Verification",
                    severity="error",
                    location=f"{file_path}:{task_id}",
                    description="Task missing verification command",
                    suggestion="Add 'Verify Pass:' or 'Verify Failure:' command to task"
                )

        # Check for proper test commands
        verify_commands = re.findall(r'Verify.*?:`(.*?)`', content)
        for command in verify_commands:
            if not any(test_runner in command for test_runner in ['pytest', 'npm test', 'python']):
                self._add_violation(
                    principle="Verification",
                    severity="warning",
                    location=file_path,
                    description=f"Verification command may not be executable: '{command}'",
                    suggestion="Use standard test runners (pytest, npm test) for verification"
                )

    def _get_line_number(self, content: str, position: int) -> int:
        """Get line number for a character position in content"""
        return content[:position].count('\n') + 1

    def validate_architecture_compliance(self, file_path: str,
                                       boundaries_file: str = ".lsf/memory/architecture-boundaries.md") -> List[ComplianceViolation]:
        """Validate compliance with architecture boundaries"""
        violations = []

        try:
            content = Path(file_path).read_text(encoding='utf-8')
            boundaries = Path(boundaries_file).read_text(encoding='utf-8')
        except FileNotFoundError as e:
            violations.append(ComplianceViolation(
                principle="Architecture Boundaries",
                severity="critical",
                location=file_path,
                description=f"Required file not found: {e}",
                suggestion="Ensure architecture boundaries file exists"
            ))
            return violations

        # Extract components mentioned in tasks
        component_pattern = r'- Component:\s*(.*?)(?=\n|$)'
        components = re.findall(component_pattern, content, re.MULTILINE)

        for component in components:
            component = component.strip()
            if component and component not in boundaries:
                violations.append(ComplianceViolation(
                    principle="Architecture Boundaries",
                    severity="error",
                    location=file_path,
                    description=f"Component '{component}' not found in architecture boundaries",
                    suggestion="Use only components defined in architecture-boundaries.md"
                ))

        return violations

    def generate_report(self, violations: List[ComplianceViolation]) -> str:
        """Generate a formatted compliance report"""
        if not violations:
            return "✅ Constitutional compliance validation passed - no violations found"

        report = ["❌ Constitutional Compliance Violations Found", "=" * 50, ""]

        # Group violations by severity
        critical = [v for v in violations if v.severity == 'critical']
        errors = [v for v in violations if v.severity == 'error']
        warnings = [v for v in violations if v.severity == 'warning']

        if critical:
            report.extend(["🚨 CRITICAL VIOLATIONS:", ""])
            for v in critical:
                report.extend([
                    f"  Principle: {v.principle}",
                    f"  Location: {v.location}",
                    f"  Issue: {v.description}",
                    f"  Fix: {v.suggestion}",
                    ""
                ])

        if errors:
            report.extend(["❌ ERRORS:", ""])
            for v in errors:
                report.extend([
                    f"  Principle: {v.principle}",
                    f"  Location: {v.location}",
                    f"  Issue: {v.description}",
                    f"  Fix: {v.suggestion}",
                    ""
                ])

        if warnings:
            report.extend(["⚠️  WARNINGS:", ""])
            for v in warnings:
                report.extend([
                    f"  Principle: {v.principle}",
                    f"  Location: {v.location}",
                    f"  Issue: {v.description}",
                    f"  Fix: {v.suggestion}",
                    ""
                ])

        # Summary
        report.extend([
            "=" * 50,
            f"Summary: {len(critical)} critical, {len(errors)} errors, {len(warnings)} warnings",
            "",
            "Constitutional compliance must be achieved before proceeding to implementation."
        ])

        return "\n".join(report)

    def export_json(self, violations: List[ComplianceViolation]) -> str:
        """Export violations to JSON format"""
        violation_dicts = []
        for v in violations:
            violation_dicts.append({
                'principle': v.principle,
                'severity': v.severity,
                'location': v.location,
                'description': v.description,
                'suggestion': v.suggestion
            })

        return json.dumps({
            'total_violations': len(violations),
            'violations': violation_dicts
        }, indent=2)


def main():
    """CLI interface for constitutional validator"""
    if len(sys.argv) < 2:
        print("Usage: python constitutional_validator.py <phase-file.md> [OPTIONS]")
        print("\nOptions:")
        print("  --json                Export violations to JSON format")
        print("  --architecture-only   Validate only architecture compliance")
        print("  --constitution FILE   Path to constitution file")
        print("  --boundaries FILE     Path to architecture boundaries file")
        sys.exit(1)

    file_path = sys.argv[1]
    options = sys.argv[2:]

    # Parse options
    constitution_file = None
    boundaries_file = ".lsf/memory/architecture-boundaries.md"
    json_output = '--json' in options
    architecture_only = '--architecture-only' in options

    if '--constitution' in options:
        idx = options.index('--constitution')
        if idx + 1 < len(options):
            constitution_file = options[idx + 1]

    if '--boundaries' in options:
        idx = options.index('--boundaries')
        if idx + 1 < len(options):
            boundaries_file = options[idx + 1]

    try:
        validator = ConstitutionalValidator(constitution_file)

        if architecture_only:
            violations = validator.validate_architecture_compliance(file_path, boundaries_file)
        else:
            violations = validator.validate_file(file_path)
            # Also check architecture compliance
            arch_violations = validator.validate_architecture_compliance(file_path, boundaries_file)
            violations.extend(arch_violations)

        if json_output:
            print(validator.export_json(violations))
        else:
            print(validator.generate_report(violations))

        # Exit with error code if violations found
        critical_errors = [v for v in violations if v.severity in ['critical', 'error']]
        sys.exit(1 if critical_errors else 0)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()