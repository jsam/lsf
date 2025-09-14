# LSF

LSF is a AI coding agent workflow for test-spec driven development.

## Installation

### Global Installation (Recommended)

#### Using uvx (Preferred for immediate use)

```bash
# Run LSF directly without installation
uvx --from git+ssh://git@github.com/jsam/lsf.git lsf init

# Or with a shorter alias
alias lsf="uvx --from git+ssh://git@github.com/jsam/lsf.git lsf"
```

#### Using uv tool (Persistent installation)

```bash
# Install LSF as a global tool
uv tool install git+ssh://git@github.com/jsam/lsf.git

# Now you can use lsf from anywhere
lsf init
```

### Development Installation

```bash
# Clone and install for development
git clone git@github.com:jsam/lsf.git
cd lsf
uv sync --dev

# Run locally with uv
uv run lsf init
```

## Usage

Once installed globally with `uv tool install`, you can use `lsf` from anywhere:

```bash
# Initialize LSF configuration in current directory
lsf init

# Initialize in a specific directory
lsf init --path /path/to/project

# Overwrite existing configuration
lsf init --overwrite

# Backup before overwriting
lsf init --backup --overwrite
```

Or run directly with `uvx`:

```bash
# One-time execution without installation
uvx --from git+ssh://git@github.com/jsam/lsf.git lsf init

# With options
uvx --from git+ssh://git@github.com/jsam/lsf.git lsf init --backup --overwrite
```

### Command Options

- `--path, -p`: Specify a different project path (default: current directory)
- `--overwrite`: Replace existing .claude and .lsf folders
- `--backup`: Create timestamped backups before overwriting existing folders
- `--debug`: Enable debug logging
- `--help`: Show help message
- `--version`: Show version

## What it does

The `lsf init` command:

1. Clones the LSF repository from GitHub
2. Copies the `.claude` and `.lsf` folders to your project
3. Cleans up the cloned repository
4. Optionally backs up existing folders before overwriting

## Examples

```bash
# Quick start - initialize current project
lsf init

# Initialize a new project
mkdir my-project && cd my-project
lsf init

# Update existing configuration (with backup)
lsf init --backup --overwrite

# Initialize multiple projects
for project in project1 project2 project3; do
  lsf init --path ./$project
done

# Run without installation using uvx
uvx --from git+ssh://git@github.com/jsam/lsf.git lsf init --path ./my-project
```

## Uninstallation

```bash
# If installed with uv tool
uv tool uninstall lsf
```

## Development

```bash
# Clone the repository
git clone git@github.com:jsam/lsf.git
cd lsf

# Install dependencies
uv sync --dev

# Run tests
just test

# Format code
just format

# Run linters
just lint

# Run all validation
just validate
```

## License

MIT