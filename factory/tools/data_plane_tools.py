"""
Data Plane Tools.

Tools for inspecting Django models and comparing data plane state.
"""

import os
import sys
from pathlib import Path
from typing import Any

import yaml


class DataPlaneInspectorTool:
    """Tool for introspecting Django models."""

    @property
    def definition(self) -> dict[str, Any]:
        """Anthropic tool definition."""
        return {
            "name": "inspect_data_plane",
            "description": "Generate current data plane state by introspecting Django models",
            "input_schema": {
                "type": "object",
                "properties": {
                    "django_settings_module": {
                        "type": "string",
                        "description": "Django settings module (e.g., 'django_celery_base.settings')"
                    }
                }
            }
        }

    def execute(self, django_settings_module: str = "django_celery_base.settings") -> str:
        """
        Introspect Django models and generate data-plane-current.yaml.

        Args:
            django_settings_module: Django settings module to use

        Returns:
            YAML string representing current data plane state
        """
        try:
            # Set up Django
            os.environ.setdefault("DJANGO_SETTINGS_MODULE", django_settings_module)

            # Add src directory to path if it exists
            src_path = Path("src")
            if src_path.exists():
                sys.path.insert(0, str(src_path.absolute()))

            import django
            django.setup()

            from django.apps import apps

            # Introspect all models
            models_data = {}

            for model in apps.get_models():
                fields = {}

                for field in model._meta.get_fields():
                    field_info = {
                        "type": field.__class__.__name__,
                    }

                    # Add nullable info if applicable
                    if hasattr(field, "null"):
                        field_info["nullable"] = field.null

                    # Add related model info for ForeignKey, etc.
                    if hasattr(field, "related_model") and field.related_model:
                        field_info["related_to"] = field.related_model.__name__

                    fields[field.name] = field_info

                models_data[model.__name__] = {
                    "app": model._meta.app_label,
                    "fields": fields
                }

            # Generate YAML
            data_plane = {"models": models_data}
            yaml_output = yaml.dump(data_plane, default_flow_style=False, sort_keys=False)

            # Write to file
            output_path = Path("specs/data-plane-current.yaml")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(yaml_output)

            return f"Generated data-plane-current.yaml with {len(models_data)} models"

        except ImportError as e:
            return f"Error: Django not configured properly: {e}"
        except Exception as e:
            return f"Error inspecting data plane: {e}"


class DataPlaneCompareTool:
    """Tool for comparing target vs current data plane."""

    @property
    def definition(self) -> dict[str, Any]:
        """Anthropic tool definition."""
        return {
            "name": "compare_data_plane",
            "description": "Compare target data plane (desired) with current data plane (actual)",
            "input_schema": {
                "type": "object",
                "properties": {
                    "target_path": {
                        "type": "string",
                        "description": "Path to data-plane-target.yaml"
                    },
                    "current_path": {
                        "type": "string",
                        "description": "Path to data-plane-current.yaml"
                    }
                },
                "required": ["target_path", "current_path"]
            }
        }

    def execute(self, target_path: str, current_path: str) -> dict[str, Any]:
        """
        Compare target vs current data plane.

        Args:
            target_path: Path to target data plane
            current_path: Path to current data plane

        Returns:
            Dict with alignment status and differences
        """
        try:
            target = yaml.safe_load(Path(target_path).read_text())
            current = yaml.safe_load(Path(current_path).read_text())

            target_models = target.get("models", {})
            current_models = current.get("models", {})

            # Find differences
            missing_models = set(target_models.keys()) - set(current_models.keys())
            extra_models = set(current_models.keys()) - set(target_models.keys())

            missing_fields = {}
            for model_name in set(target_models.keys()) & set(current_models.keys()):
                target_fields = set(target_models[model_name].get("fields", {}).keys())
                current_fields = set(current_models[model_name].get("fields", {}).keys())

                model_missing = target_fields - current_fields
                if model_missing:
                    missing_fields[model_name] = list(model_missing)

            aligned = len(missing_models) == 0 and len(missing_fields) == 0

            return {
                "aligned": aligned,
                "missing_models": list(missing_models),
                "extra_models": list(extra_models),
                "missing_fields": missing_fields,
                "message": "Data plane aligned" if aligned else "Data plane misalignment detected"
            }

        except FileNotFoundError as e:
            return {
                "aligned": False,
                "error": f"File not found: {e}",
                "message": "Cannot compare: file missing"
            }
        except Exception as e:
            return {
                "aligned": False,
                "error": str(e),
                "message": f"Comparison failed: {e}"
            }
