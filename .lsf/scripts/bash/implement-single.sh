#!/usr/bin/env bash
# Execute single-agent implementation with TDD loop and quality checks
set -e

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] selector [--quality-gates auto|manual]"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

IMPLEMENTATION_ARGS="${ARGS[*]}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

eval $(get_feature_paths)
check_feature_branch "$CURRENT_BRANCH" || exit 1

# Validate prerequisites
if [[ ! -f "$TASKS" ]]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR" >&2
    echo "Run /breakdown first." >&2
    exit 1
fi

# Parse implementation arguments
TASK_SELECTOR=""
QUALITY_GATES="auto"
EXECUTION_MODE="sequential"

# Simple argument parsing
if [[ "$IMPLEMENTATION_ARGS" =~ --quality-gates[[:space:]]+(auto|manual) ]]; then
    QUALITY_GATES="${BASH_REMATCH[1]}"
fi

# Extract task selector (first non-flag argument)
for arg in $IMPLEMENTATION_ARGS; do
    if [[ ! "$arg" =~ ^-- ]] && [[ -z "$TASK_SELECTOR" ]]; then
        TASK_SELECTOR="$arg"
        break
    fi
done

# Default to first pending task if no selector provided
if [[ -z "$TASK_SELECTOR" ]]; then
    TASK_SELECTOR="P1-001"
fi

# Generate unique execution ID
EXECUTION_ID="single-$(date +%s)-$(echo "$TASK_SELECTOR" | tr ',' '-')"

# Validate task selector format and extract selected tasks
SELECTED_TASKS=()
if [[ "$TASK_SELECTOR" =~ ^P1-[0-9]{3}$ ]]; then
    # Single task
    SELECTED_TASKS=("$TASK_SELECTOR")
elif [[ "$TASK_SELECTOR" =~ ^P1-[0-9]{3}(,P1-[0-9]{3})*$ ]]; then
    # Comma-separated tasks
    IFS=',' read -ra SELECTED_TASKS <<< "$TASK_SELECTOR"
elif [[ "$TASK_SELECTOR" =~ ^P1-([0-9]{3})\.\.P1-([0-9]{3})$ ]]; then
    # Range of tasks
    START_NUM=${BASH_REMATCH[1]}
    END_NUM=${BASH_REMATCH[2]}
    for ((i=START_NUM; i<=END_NUM; i++)); do
        SELECTED_TASKS+=("$(printf "P1-%03d" $i)")
    done
else
    echo "ERROR: Invalid task selector format: $TASK_SELECTOR" >&2
    echo "Use: P1-001, P1-001,P1-002, or P1-001..P1-005" >&2
    exit 1
fi

# Validate selected tasks exist in tasks.md
MISSING_TASKS=()
for task in "${SELECTED_TASKS[@]}"; do
    if ! grep -q "^### $task:" "$TASKS"; then
        MISSING_TASKS+=("$task")
    fi
done

if [[ ${#MISSING_TASKS[@]} -gt 0 ]]; then
    echo "ERROR: Tasks not found in $TASKS:" >&2
    printf "  %s\n" "${MISSING_TASKS[@]}" >&2
    exit 1
fi

# Verify task dependencies are satisfied
for task in "${SELECTED_TASKS[@]}"; do
    # Extract dependencies (simplified - in real implementation would be more robust)
    deps=$(grep -A 10 "^### $task:" "$TASKS" | grep "Dependencies:" | sed 's/.*Dependencies: *//' | sed 's/[^P10-9, -]//g')
    if [[ -n "$deps" && "$deps" != "None" ]]; then
        IFS=',' read -ra DEP_ARRAY <<< "$deps"
        for dep in "${DEP_ARRAY[@]}"; do
            dep=$(echo "$dep" | xargs) # trim whitespace
            if [[ -n "$dep" ]] && ! grep -q "^### $dep:.*\\[x\\]" "$TASKS"; then
                echo "ERROR: Task $task depends on incomplete task: $dep" >&2
                exit 1
            fi
        done
    fi
done

# Ensure git working directory is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "ERROR: Git working directory is not clean. Please commit or stash changes." >&2
    exit 1
fi

# Get current branch info
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BRANCH_INFO="$CURRENT_BRANCH"

# Create workspace directory for single-agent execution
WORKSPACE_DIR="$FEATURE_DIR/implementation"
mkdir -p "$WORKSPACE_DIR"

# Create execution metadata
WORKFLOW_STATUS="initialized"
cat > "$WORKSPACE_DIR/execution-$EXECUTION_ID.json" <<EOF
{
    "execution_id": "$EXECUTION_ID",
    "task_selection": "$TASK_SELECTOR",
    "selected_tasks": $(printf '%s\n' "${SELECTED_TASKS[@]}" | jq -R . | jq -s .),
    "quality_gates": "$QUALITY_GATES",
    "execution_mode": "$EXECUTION_MODE",
    "branch_info": "$BRANCH_INFO",
    "workflow_status": "$WORKFLOW_STATUS",
    "started_at": "$(date -Iseconds)",
    "tasks_file": "$TASKS",
    "workspace_dir": "$WORKSPACE_DIR"
}
EOF

if [[ "$JSON_MODE" == "true" ]]; then
    cat <<EOF
{
    "EXECUTION_ID": "$EXECUTION_ID",
    "TASK_SELECTION": "$TASK_SELECTOR",
    "BRANCH_INFO": "$BRANCH_INFO",
    "WORKFLOW_STATUS": "$WORKFLOW_STATUS",
    "SELECTED_TASKS": $(printf '%s\n' "${SELECTED_TASKS[@]}" | jq -R . | jq -s .),
    "QUALITY_GATES": "$QUALITY_GATES",
    "EXECUTION_MODE": "$EXECUTION_MODE",
    "WORKSPACE_DIR": "$WORKSPACE_DIR"
}
EOF
else
    echo "Single-agent implementation initialized:"
    echo "  Execution ID: $EXECUTION_ID"
    echo "  Selected tasks: ${SELECTED_TASKS[*]}"
    echo "  Quality gates: $QUALITY_GATES"
    echo "  Branch: $BRANCH_INFO"
    echo "  Workspace: $WORKSPACE_DIR"
    echo ""
    echo "Ready for TDD implementation workflow."
    echo "Tasks will be executed sequentially with quality checks."
fi
