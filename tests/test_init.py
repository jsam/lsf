"""Tests for the init command."""

from pathlib import Path
from unittest.mock import patch

from click.testing import CliRunner

from lsf.cli import main


class TestInitCommand:
    """Test suite for init command."""

    def setup_method(self):
        """Set up test fixtures."""
        self.runner = CliRunner()

    def test_init_help(self):
        """Test that init command shows help."""
        result = self.runner.invoke(main, ["init", "--help"])
        assert result.exit_code == 0
        assert "Initialize LSF configuration" in result.output

    def test_init_with_existing_folders_no_overwrite(self):
        """Test init fails when folders exist without overwrite flag."""
        with self.runner.isolated_filesystem():
            # Create existing folders
            Path(".claude").mkdir()
            Path(".lsf").mkdir()

            result = self.runner.invoke(main, ["init"])
            assert result.exit_code != 0
            assert "Folders already exist" in result.output

    @patch("git.Repo")
    def test_init_clone_failure(self, mock_repo):
        """Test init handles clone failure gracefully."""
        mock_repo.clone_from.side_effect = Exception("Network error")

        with self.runner.isolated_filesystem():
            result = self.runner.invoke(main, ["init"])
            assert result.exit_code != 0
            assert "Failed to clone repository" in result.output

    def test_cli_version(self):
        """Test CLI version command."""
        result = self.runner.invoke(main, ["--version"])
        assert result.exit_code == 0
        assert "lsf, version" in result.output

    def test_cli_help(self):
        """Test CLI help output."""
        result = self.runner.invoke(main, ["--help"])
        assert result.exit_code == 0
        assert "LSF - Configuration Management CLI" in result.output
        assert "init" in result.output
