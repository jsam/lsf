"""
Minimal pytest configuration for unit tests.
Unit tests focus on complex algorithms and pure functions only.
"""

import pytest
import sys
from pathlib import Path

# Add src to path for imports
src_path = Path(__file__).parent.parent.parent / "src"
sys.path.insert(0, str(src_path))


@pytest.fixture
def sample_data():
    """Basic test data for algorithm testing."""
    return {
        "numbers": [1, 2, 3, 4, 5],
        "text": "test_string",
        "empty_list": [],
        "nested_dict": {"key": "value", "nested": {"inner": 42}}
    }