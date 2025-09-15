#!/usr/bin/env bash
# Initialize project constitution and governance structure
set -e

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] [project_name] [--version VERSION]"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

INIT_ARGS="${ARGS[*]}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get repository root and basic info
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

# Parse initialization arguments
PROJECT_NAME=""
CONSTITUTION_VERSION="3.0.0"

# Simple argument parsing
for arg in $INIT_ARGS; do
    if [[ "$arg" =~ ^--version$ ]]; then
        continue
    elif [[ "$arg" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        CONSTITUTION_VERSION="$arg"
    elif [[ ! "$arg" =~ ^-- ]] && [[ -z "$PROJECT_NAME" ]]; then
        PROJECT_NAME="$arg"
    fi
done

# Default project name from repository
if [[ -z "$PROJECT_NAME" ]]; then
    PROJECT_NAME="$(basename "$REPO_ROOT")"
fi

# Set up constitution directory structure
CONSTITUTION_DIR="$REPO_ROOT/specs/constitution"
CONSTITUTION_FILE="$CONSTITUTION_DIR/constitution.md"
CHECKLIST_FILE="$CONSTITUTION_DIR/constitution_update_checklist.md"
AMENDMENTS_DIR="$CONSTITUTION_DIR/amendments"

# Create directory structure
mkdir -p "$CONSTITUTION_DIR"
mkdir -p "$AMENDMENTS_DIR"

# Load constitution template - try memory/ first (actual constitution), then .lsf/memory/ (template)
CONSTITUTION_TEMPLATE="$REPO_ROOT/memory/constitution.md"
CHECKLIST_TEMPLATE="$REPO_ROOT/memory/constitution_update_checklist.md"

if [[ ! -f "$CONSTITUTION_TEMPLATE" ]]; then
    CONSTITUTION_TEMPLATE="$REPO_ROOT/.lsf/memory/constitution.md"
    CHECKLIST_TEMPLATE="$REPO_ROOT/.lsf/memory/constitution_update_checklist.md"
fi

if [[ ! -f "$CONSTITUTION_TEMPLATE" ]]; then
    echo "ERROR: Constitution template not found at $CONSTITUTION_TEMPLATE" >&2
    echo "Looking for: .lsf/memory/constitution.md or memory/constitution.md" >&2
    exit 1
fi

# Get current date
CURRENT_DATE=$(date -I 2>/dev/null || date "+%Y-%m-%d")

# Create constitution.md with project-specific details
sed -e "s/LSF Single-Agent TDD Workflow Constitution/$PROJECT_NAME Constitution/" \
    -e "s/Version\*\*: 3\.0\.0/Version**: $CONSTITUTION_VERSION/" \
    -e "s/Ratified\*\*: 2025-09-13/Ratified**: $CURRENT_DATE/" \
    -e "s/Last Amended\*\*: 2025-09-13/Last Amended**: $CURRENT_DATE/" \
    -e "s/LSF Single-Agent TDD Workflow system/$PROJECT_NAME project/" \
    "$CONSTITUTION_TEMPLATE" > "$CONSTITUTION_FILE"

# Create constitution update checklist if template exists
if [[ -f "$CHECKLIST_TEMPLATE" ]]; then
    sed -e "s/2025-09-13/$CURRENT_DATE/" \
        -e "s/3\.0\.0/$CONSTITUTION_VERSION/" \
        "$CHECKLIST_TEMPLATE" > "$CHECKLIST_FILE"
fi

# Create initial governance report
GOVERNANCE_REPORT="$CONSTITUTION_DIR/governance_report.md"
cat > "$GOVERNANCE_REPORT" <<EOF
# $PROJECT_NAME Governance Report

**Generated**: $CURRENT_DATE  
**Constitution Version**: $CONSTITUTION_VERSION  
**Status**: Initialized  

## Constitutional Framework

### Core Principles
- ✅ Library-First Architecture
- ✅ CLI Interface Requirements
- ✅ Test-First Development (TDD)
- ✅ Single-Agent Sequential Workflow
- ✅ Quality Gates & Reviews
- ✅ Observability & Monitoring
- ✅ Simplicity & Extensibility

### Governance Structure
- **Constitution**: specs/constitution/constitution.md
- **Update Checklist**: specs/constitution/constitution_update_checklist.md
- **Amendments Directory**: specs/constitution/amendments/
- **Governance Report**: specs/constitution/governance_report.md

## Compliance Status

### Implementation Readiness
- [x] Constitutional framework established
- [x] Governance structure created
- [x] Amendment process documented
- [ ] Team training on constitutional principles
- [ ] Development workflow integration
- [ ] Quality gate automation

### Next Steps
1. Review constitutional principles with development team
2. Integrate constitutional compliance into CI/CD pipeline
3. Set up regular governance reviews and updates
4. Begin first feature development using constitutional workflow

## Amendment History
*No amendments yet*

---

*This report tracks constitutional compliance and governance health for $PROJECT_NAME*
EOF

# Create README for constitution directory
README_FILE="$CONSTITUTION_DIR/README.md"
cat > "$README_FILE" <<EOF
# $PROJECT_NAME Constitution

This directory contains the constitutional framework and governance structure for $PROJECT_NAME.

## Files

- **constitution.md** - Core constitutional principles and development standards
- **constitution_update_checklist.md** - Checklist for maintaining constitutional consistency
- **governance_report.md** - Current governance status and compliance tracking
- **amendments/** - Directory for constitutional amendments and changes

## Usage

The constitution defines non-negotiable principles for development:

1. **Library-First Architecture** - Every feature as a standalone library
2. **CLI Interface** - Text in/out protocol for all libraries
3. **Test-First Development** - Mandatory TDD with Red-Green-Refactor cycle
4. **Single-Agent Workflow** - Sequential task execution with quality gates
5. **Quality & Reviews** - Automated quality gates and compliance checking
6. **Observability** - Structured logging and monitoring requirements
7. **Simplicity & Extensibility** - YAGNI principles with clear extension points

## Amendment Process

1. Propose change with clear justification
2. Document impact using constitution_update_checklist.md
3. Update all dependent templates and commands
4. Test change with sample implementation
5. Version bump and add to amendments/ directory

## Compliance

All development must comply with constitutional principles. Quality gates automatically verify adherence during the development workflow.

---

Constitution Version: $CONSTITUTION_VERSION | Established: $CURRENT_DATE
EOF

SETUP_STATUS="complete"

# Output results
if [[ "$JSON_MODE" == "true" ]]; then
    cat <<EOF
{
    "PROJECT_NAME": "$PROJECT_NAME",
    "CONSTITUTION_DIR": "$CONSTITUTION_DIR",
    "CONSTITUTION_FILE": "$CONSTITUTION_FILE",
    "CONSTITUTION_VERSION": "$CONSTITUTION_VERSION",
    "SETUP_STATUS": "$SETUP_STATUS",
    "GOVERNANCE_REPORT": "$GOVERNANCE_REPORT",
    "AMENDMENTS_DIR": "$AMENDMENTS_DIR",
    "RATIFICATION_DATE": "$CURRENT_DATE"
}
EOF
else
    echo "Constitutional framework initialized for: $PROJECT_NAME"
    echo "Constitution directory: $CONSTITUTION_DIR"
    echo "Constitution file: $CONSTITUTION_FILE"
    echo "Constitution version: $CONSTITUTION_VERSION"
    echo "Ratified on: $CURRENT_DATE"
    echo ""
    echo "Governance structure:"
    echo "  - Constitution: specs/constitution/constitution.md"
    echo "  - Update checklist: specs/constitution/constitution_update_checklist.md"
    echo "  - Governance report: specs/constitution/governance_report.md"
    echo "  - Amendments directory: specs/constitution/amendments/"
    echo ""
    echo "Next steps:"
    echo "  1. Review constitutional principles with your team"
    echo "  2. Begin development using /epic → /breakdown → /test → /implement → /review → /refactor workflow"
    echo "  3. Ensure all development follows constitutional compliance"
    echo ""
    echo "Constitutional framework ready for $PROJECT_NAME development!"
fi