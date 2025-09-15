#!/usr/bin/env bash
# Transform epic into technical blueprint and ordered task list
set -e

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] [technical_context]"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

TECHNICAL_CONTEXT="${ARGS[*]}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

eval $(get_feature_paths)
check_feature_branch "$CURRENT_BRANCH" || exit 1

# Validate prerequisites
if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR" >&2
    echo "Run /epic first." >&2
    exit 1
fi

# Check for epic.md
EPIC_FILE="$FEATURE_DIR/epic.md"
if [[ ! -f "$EPIC_FILE" ]]; then
    echo "ERROR: No epic.md found in $FEATURE_DIR" >&2
    echo "Run /epic first." >&2
    exit 1
fi

# Set up output files
BREAKDOWN_FILE="$FEATURE_DIR/breakdown.md"
TASKS_FILE="$TASKS"

# Copy templates
BREAKDOWN_TEMPLATE="$REPO_ROOT/.lsf/templates/breakdown-template.md"
TASKS_TEMPLATE="$REPO_ROOT/.lsf/templates/tasks-template.md"

# Task reconciliation function
reconcile_existing_tasks() {
    local existing_tasks="$1"
    local new_tasks="$2"
    local reconciled_tasks="$3"
    
    # If no existing tasks, just use new tasks
    if [[ ! -f "$existing_tasks" ]]; then
        cp "$new_tasks" "$reconciled_tasks"
        return 0
    fi
    
    echo "INFO: Reconciling existing tasks with new breakdown" >&2
    
    # Create temporary files for parsing
    local temp_existing="/tmp/existing_tasks_$$.md"
    local temp_new="/tmp/new_tasks_$$.md"
    local temp_reconciled="/tmp/reconciled_tasks_$$.md"
    
    # Parse existing completed tasks (preserve [x] status)
    grep -E "^[[:space:]]*-[[:space:]]*\[x\][[:space:]]*\*\*P1-[0-9]{3}\*\*:" "$existing_tasks" > "$temp_existing" 2>/dev/null || true
    
    # Copy new tasks template as base
    cp "$new_tasks" "$temp_reconciled"
    
    # Find highest existing task ID to continue numbering
    local max_id=0
    if [[ -s "$temp_existing" ]]; then
        # Extract P1-xxx numbers and find maximum
        local existing_ids=$(grep -o "P1-[0-9][0-9][0-9]" "$temp_existing" 2>/dev/null | sed 's/P1-0*//' | sort -n | tail -1)
        if [[ -n "$existing_ids" ]]; then
            max_id=$existing_ids
        fi
    fi
    
    # Update task numbering in new template to continue from max_id
    local counter=$((max_id + 1))
    while read -r line; do
        if [[ "$line" =~ ^[[:space:]]*-[[:space:]]*\[[[:space:]]\][[:space:]]*\*\*P1-[0-9][0-9][0-9]\*\*: ]]; then
            # Replace task ID with next sequential number
            local new_id=$(printf "P1-%03d" $counter)
            echo "$line" | sed "s/P1-[0-9][0-9][0-9]/$new_id/"
            counter=$((counter + 1))
        else
            echo "$line"
        fi
    done < "$temp_reconciled" > "$reconciled_tasks"
    
    # Append completed tasks from existing file to reconciled file
    if [[ -s "$temp_existing" ]]; then
        echo "" >> "$reconciled_tasks"
        echo "## Previously Completed Tasks" >> "$reconciled_tasks"
        echo "*Tasks completed in previous breakdown iterations*" >> "$reconciled_tasks"
        echo "" >> "$reconciled_tasks"
        cat "$temp_existing" >> "$reconciled_tasks"
    fi
    
    # Cleanup temp files
    rm -f "$temp_existing" "$temp_new" "$temp_reconciled"
    
    echo "INFO: Task reconciliation complete - preserved $(wc -l < "$temp_existing" 2>/dev/null || echo 0) completed tasks" >&2
}

if [[ -f "$BREAKDOWN_TEMPLATE" ]]; then
    cp "$BREAKDOWN_TEMPLATE" "$BREAKDOWN_FILE"
else
    # Create basic breakdown structure
    cat > "$BREAKDOWN_FILE" << 'EOF'
# Technical Breakdown: [FEATURE]

## Architecture Decisions
[Technical approach and design patterns]

## Data Models
[Entity definitions and relationships]

## API Design
[Endpoints and interfaces]

## Implementation Strategy
[Development approach and priorities]

## Dependencies
[External libraries and services]

## Non-Functional Requirements
[Performance, security, scalability]
EOF
fi

# Handle tasks.md creation with reconciliation  
if [[ -f "$TASKS_TEMPLATE" ]]; then
    # Use reconciliation to merge existing and new tasks
    temp_tasks="/tmp/new_tasks_$$.md"
    cp "$TASKS_TEMPLATE" "$temp_tasks"
    reconcile_existing_tasks "$TASKS_FILE" "$temp_tasks" "$TASKS_FILE"
    rm -f "$temp_tasks"
else
    # Create basic tasks structure
    cat > "$TASKS_FILE" << 'EOF'
# Tasks: [FEATURE]

## Task List

### Setup & Infrastructure
- [ ] **P1-001**: Project setup and dependencies
  - **Files**: `pyproject.toml`, setup configuration
  - **DoD**: Dependencies installed, project structure ready

### Test Development (TDD Red Phase)
- [ ] **P1-002**: Create test suite structure [P]
  - **Files**: `test/` directory structure
  - **DoD**: Test files created, initially failing

### Implementation
- [ ] **P1-003**: Core functionality implementation
  - **Files**: `src/` main modules
  - **DoD**: Tests passing, functionality complete

### Integration & Quality
- [ ] **P1-004**: Integration testing and quality checks
  - **Files**: Integration tests, quality gates
  - **DoD**: Full test suite passing, quality metrics met

## Parallel Execution Groups
- **Group: Infrastructure** - P1-001 (sequential)
- **Group: Testing** - P1-002 (parallel possible)
- **Group: Implementation** - P1-003+ (based on file dependencies)
EOF
fi

# Create additional directories if needed
mkdir -p "$FEATURE_DIR/implementation"
mkdir -p "$FEATURE_DIR/implementation/agents"
mkdir -p "$FEATURE_DIR/implementation/reviews"

if $JSON_MODE; then
    printf '{"EPIC_FILE":"%s","BREAKDOWN_FILE":"%s","TASKS_FILE":"%s","SPECS_DIR":"%s","BRANCH":"%s","TECHNICAL_CONTEXT":"%s"}\n' \
        "$EPIC_FILE" "$BREAKDOWN_FILE" "$TASKS_FILE" "$FEATURE_DIR" "$CURRENT_BRANCH" "$TECHNICAL_CONTEXT"
else
    echo "EPIC_FILE: $EPIC_FILE"
    echo "BREAKDOWN_FILE: $BREAKDOWN_FILE"  
    echo "TASKS_FILE: $TASKS_FILE"
    echo "SPECS_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo "TECHNICAL_CONTEXT: $TECHNICAL_CONTEXT"
fi