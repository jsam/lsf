# LSF Commands Reference

## Overview

LSF provides a simple command-line interface focused on project initialization and configuration management. The tool is designed to be lightweight and focused on the essential task of setting up standardized development workflows.

## Available Commands

### `lsf init`

**Purpose**: Initialize LSF configuration in a project by cloning standard templates from the LSF repository.

**Usage**:
```bash
lsf init [OPTIONS]
```

**What it does**:
1. Clones the LSF repository from GitHub (https://github.com/jsam/lsf.git)
2. Copies `.claude` and `.lsf` folders to your project directory
3. Cleans up the temporary cloned repository
4. Optionally handles existing folders with backup/overwrite options

**Options**:

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--path` | `-p` | Project path to initialize | Current directory (`.`) |
| `--overwrite` | - | Replace existing .claude and .lsf folders | False |
| `--backup` | - | Create timestamped backups before overwriting | False |
| `--help` | - | Show command help | - |

**Examples**:

```bash
# Initialize current directory
lsf init

# Initialize specific directory
lsf init --path /path/to/project

# Overwrite existing configuration
lsf init --overwrite

# Backup existing folders before overwriting
lsf init --backup --overwrite

# Initialize new project directory
mkdir my-new-project
cd my-new-project
lsf init
```

**Error Handling**:

- **Existing Folders**: If `.claude` or `.lsf` folders already exist, the command will fail unless `--overwrite` is specified
- **Network Issues**: If the repository cannot be cloned (network issues, invalid repository), the command will fail with a descriptive error
- **Permission Issues**: If the target directory is not writable, the command will fail

**Output**:

The command provides rich, colorful output showing:
- Progress indicators during cloning and copying
- Success/error status for each folder
- Final confirmation of successful initialization
- Backup information (if `--backup` used)

## Global Options

These options are available for all LSF commands:

| Option | Description |
|--------|-------------|
| `--version` | Show LSF version and exit |
| `--debug` | Enable debug logging for troubleshooting |
| `--help` | Show general help information |

**Examples**:
```bash
# Check LSF version
lsf --version

# Enable debug output
lsf --debug init

# Show general help
lsf --help
```

## What Gets Installed

When you run `lsf init`, the following structure is created in your project:

### `.claude/` Directory
Contains configurations and templates for AI coding agents:
- **commands/**: Custom Claude commands for project-specific workflows
- **templates/**: Reusable templates for common development tasks
- Configuration files for AI agent behavior and context

### `.lsf/` Directory  
Contains LSF-specific project configuration:
- **config/**: Project settings and workflow configuration
- **scripts/**: Automation scripts for development tasks
- **memory/**: Constitutional framework and governance documents

### `specs/` Directory
Contains project specifications and governance:
- **constitution/**: Constitutional framework defining development principles
- **001-*/**: Feature specifications and epic documentation

## Exit Codes

LSF commands return standard exit codes:

- **0**: Success
- **1**: General error (network issues, file system errors)
- **2**: Command line argument error (invalid options, missing required arguments)

## Configuration

LSF uses the configuration files installed in the `.lsf/config/` directory:

- **settings.json**: Basic project configuration
- Version information and feature flags
- Workflow customization settings

## Troubleshooting

### Common Issues

**"Folders already exist" error**:
```bash
# Solution: Use --overwrite flag
lsf init --overwrite
```

**"Failed to clone repository" error**:
- Check internet connection
- Verify repository URL is accessible
- Try again in a few minutes

**Permission denied errors**:
- Ensure you have write permissions to the target directory
- Check if any files are being used by other processes

### Debug Mode

Enable debug logging to get more detailed information:
```bash
lsf --debug init
```

This will show:
- Detailed git operations
- File system operations
- Internal state information
- Network request details

### Getting Help

- Use `lsf --help` for general help
- Use `lsf init --help` for command-specific help
- Check the repository for documentation updates
- Review the constitutional framework in `specs/constitution/`