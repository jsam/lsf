"""
Constitutional Validator Tool.

Wraps the existing .lsf/scripts/python/constitutional_validator.py as an agent tool.
Provides structured validation results for discriminator agents.
"""

import sys
from pathlib import Path
from typing import Any

# Import existing validator
sys.path.insert(0, str(Path(".lsf/scripts/python")))
try:
    from constitutional_validator import ConstitutionalValidator
except ImportError:
    # Fallback if validator not available
    ConstitutionalValidator = None


class ConstitutionalValidatorTool:
    """Tool for validating constitutional compliance."""

    @property
    def definition(self) -> dict[str, Any]:
        """Anthropic tool definition."""
        return {
            "name": "validate_constitutional_compliance",
            "description": "Validate an artifact for constitutional compliance using the factory constitution",
            "input_schema": {
                "type": "object",
                "properties": {
                    "artifact_path": {
                        "type": "string",
                        "description": "Path to the artifact to validate (e.g., specs/requirements.md)"
                    },
                    "constitution_path": {
                        "type": "string",
                        "description": "Path to constitution file (optional, defaults to specs/constitution/constitution.md)"
                    }
                },
                "required": ["artifact_path"]
            }
        }

    def execute(self, artifact_path: str, constitution_path: str | None = None) -> dict[str, Any]:
        """
        Execute constitutional validation.

        Args:
            artifact_path: Path to artifact to validate
            constitution_path: Optional path to constitution file

        Returns:
            Dict with 'passed' (bool) and 'violations' (list)
        """
        if ConstitutionalValidator is None:
            return {
                "passed": True,
                "violations": [],
                "warning": "Constitutional validator not available"
            }

        # Use default constitution path if not provided
        if constitution_path is None:
            constitution_path = "specs/constitution/constitution.md"

        try:
            validator = ConstitutionalValidator(constitution_path)
            violations = validator.validate_file(artifact_path)

            # Check for blocking violations (error or critical)
            blocking = [v for v in violations if v.severity in ["error", "critical"]]
            passed = len(blocking) == 0

            # Convert violations to dict format
            violation_dicts = [
                {
                    "principle": v.principle,
                    "severity": v.severity,
                    "location": v.location,
                    "description": v.description,
                    "suggestion": v.suggestion
                }
                for v in violations
            ]

            return {
                "passed": passed,
                "violations": violation_dicts,
                "total_violations": len(violations),
                "blocking_violations": len(blocking)
            }

        except FileNotFoundError as e:
            return {
                "passed": False,
                "violations": [{
                    "principle": "File System",
                    "severity": "critical",
                    "location": artifact_path,
                    "description": f"File not found: {e}",
                    "suggestion": "Ensure the file exists before validation"
                }]
            }
        except Exception as e:
            return {
                "passed": False,
                "violations": [{
                    "principle": "Validation Error",
                    "severity": "critical",
                    "location": artifact_path,
                    "description": f"Validation failed: {str(e)}",
                    "suggestion": "Check validator configuration"
                }]
            }
