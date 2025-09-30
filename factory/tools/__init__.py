"""
Factory-specific tools for Claude agents.

Only tools that wrap complex logic. Agents use native bash/read/write for basic operations.
"""

from factory.tools.constitutional_validator_tool import ConstitutionalValidatorTool
from factory.tools.data_plane_tools import DataPlaneInspectorTool, DataPlaneCompareTool

# All factory tools (only 2 specialized tools)
FACTORY_TOOLS = [
    ConstitutionalValidatorTool(),
    DataPlaneInspectorTool(),
]

# Tools for discriminator agents
DISCRIMINATOR_TOOLS = [
    ConstitutionalValidatorTool(),
]

# Tools for executor agents
EXECUTOR_TOOLS = [
    DataPlaneInspectorTool(),
    DataPlaneCompareTool(),
]

__all__ = [
    "ConstitutionalValidatorTool",
    "DataPlaneInspectorTool",
    "DataPlaneCompareTool",
    "FACTORY_TOOLS",
    "DISCRIMINATOR_TOOLS",
    "EXECUTOR_TOOLS",
]
