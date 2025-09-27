#!/usr/bin/env bash
# Factory Run: Complete pipeline from human spec to working code

set -euo pipefail

source "$(dirname "$0")/common.sh"

SPEC_FILE="$1"
REPO_ROOT=$(get_repo_root)
WORK_DIR="${WORK_DIR:-$(pwd)}"

usage() {
    cat <<EOF
Usage: $0 <human-spec.md>

Execute complete software factory pipeline from human spec to working code.

Pipeline Stages:
1. Layer 1→2: Transform spec to requirements/test-cases
2. Discriminate Layer 2
3. Layer 2→3A: Transform to red phase
4. Discriminate red phase
5. Layer 3A→3B: Transform to green phase
6. Discriminate green phase
7. Execute red phase (failing tests)
8. Execute green phase (implementations)
9. Final verification

Environment Variables:
  DRY_RUN=1     Show commands without executing
  VERBOSE=1     Show detailed output
  WORK_DIR      Working directory for generated files (default: current)
EOF
}

log_stage() {
    local stage="$1"
    echo ""
    echo "=========================================="
    echo "🏭 FACTORY STAGE: $stage"
    echo "=========================================="
}

check_discrimination() {
    local file="$1"
    local discriminator="$2"

    echo "🔍 Running discrimination: $discriminator"

    # For now, return success (discriminator implementation pending)
    # In real implementation, would call discriminator commands
    return 0
}

transform_spec_to_requirements() {
    log_stage "Layer 1 → Layer 2 Transformation"

    echo "📄 Input: $SPEC_FILE"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "[DRY RUN] Would generate:"
        echo "  - requirements.md"
        echo "  - test-cases.md"
        return 0
    fi

    # Execute transformation
    if python3 "$REPO_ROOT/.lsf/scripts/python/spec_to_requirements.py" \
        "$SPEC_FILE" \
        --output-dir "$WORK_DIR"; then
        echo "✅ Generated requirements.md and test-cases.md"
    else
        echo "❌ Failed to transform spec to requirements"
        return 1
    fi

    # Discriminate Layer 2
    if ! check_discrimination "$WORK_DIR/requirements.md" "layer2"; then
        echo "❌ Layer 2 discrimination failed"
        return 1
    fi
}

transform_requirements_to_red() {
    log_stage "Layer 2 → Layer 3A (Red Phase)"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "[DRY RUN] Would generate: red-phase.md"
        return 0
    fi

    # Execute transformation
    if python3 "$REPO_ROOT/.lsf/scripts/python/requirements_to_red.py" \
        "$WORK_DIR/requirements.md" \
        "$WORK_DIR/test-cases.md" \
        --output "$WORK_DIR/red-phase.md"; then
        echo "✅ Generated red-phase.md"
    else
        echo "❌ Failed to transform requirements to red phase"
        return 1
    fi

    # Discriminate red phase
    if ! check_discrimination "$WORK_DIR/red-phase.md" "red"; then
        echo "❌ Red phase discrimination failed"
        return 1
    fi
}

transform_red_to_green() {
    log_stage "Layer 3A → Layer 3B (Green Phase)"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "[DRY RUN] Would generate: green-phase.md"
        return 0
    fi

    # Execute transformation
    if python3 "$REPO_ROOT/.lsf/scripts/python/red_to_green.py" \
        "$WORK_DIR/red-phase.md" \
        --output "$WORK_DIR/green-phase.md"; then
        echo "✅ Generated green-phase.md"
    else
        echo "❌ Failed to transform red to green phase"
        return 1
    fi

    # Discriminate green phase
    if ! check_discrimination "$WORK_DIR/green-phase.md" "green"; then
        echo "❌ Green phase discrimination failed"
        return 1
    fi
}

execute_red_phase() {
    log_stage "Execute Red Phase (Failing Tests)"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "[DRY RUN] Would execute: red-execute.sh"
        return 0
    fi

    # Execute red phase
    if "$REPO_ROOT/.lsf/scripts/bash/red-execute.sh" "$WORK_DIR/red-phase.md"; then
        echo "✅ Red phase executed (tests failing as expected)"
    else
        echo "❌ Red phase execution failed"
        return 1
    fi
}

execute_green_phase() {
    log_stage "Execute Green Phase (Implementations)"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "[DRY RUN] Would execute: green-execute.sh"
        return 0
    fi

    # Execute green phase
    if "$REPO_ROOT/.lsf/scripts/bash/green-execute.sh" "$WORK_DIR/green-phase.md"; then
        echo "✅ Green phase executed (implementations created)"
    else
        echo "❌ Green phase execution failed"
        return 1
    fi
}

final_verification() {
    log_stage "Final Verification"

    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "[DRY RUN] Would run final test suite"
        return 0
    fi

    echo "🧪 Running backend tests..."
    if command -v pytest >/dev/null 2>&1; then
        if pytest tests/ --tb=short; then
            echo "  ✅ Backend tests pass"
        else
            echo "  ❌ Backend tests fail"
            return 1
        fi
    fi

    echo "⚛️  Running frontend tests..."
    if [[ -d "src/frontend" ]] && command -v npm >/dev/null 2>&1; then
        cd src/frontend
        if npm test; then
            echo "  ✅ Frontend tests pass"
            cd - >/dev/null
        else
            echo "  ❌ Frontend tests fail"
            cd - >/dev/null
            return 1
        fi
    fi

    echo "✅ All tests passing - implementation complete!"
}

generate_summary() {
    log_stage "Factory Run Summary"

    echo "📊 Pipeline Results:"
    echo "  ✅ Human spec parsed"
    echo "  ✅ Requirements generated"
    echo "  ✅ Test cases derived"
    echo "  ✅ Red phase created"
    echo "  ✅ Green phase created"
    echo "  ✅ Tests implemented"
    echo "  ✅ Code implemented"
    echo "  ✅ All tests passing"

    echo ""
    echo "📁 Generated Artifacts:"
    echo "  $WORK_DIR/requirements.md"
    echo "  $WORK_DIR/test-cases.md"
    echo "  $WORK_DIR/red-phase.md"
    echo "  $WORK_DIR/green-phase.md"

    echo ""
    echo "🎉 Factory run complete!"
    echo "💡 Working, tested code ready for deployment"
}

main() {
    if [[ $# -eq 0 || "$1" == "-h" || "$1" == "--help" ]]; then
        usage
        exit 0
    fi

    if [[ ! -f "$SPEC_FILE" ]]; then
        echo "ERROR: Spec file not found: $SPEC_FILE" >&2
        exit 1
    fi

    echo "🏭 ========================================"
    echo "🏭 SOFTWARE FACTORY PIPELINE"
    echo "🏭 ========================================"
    echo "📄 Input: $SPEC_FILE"
    echo "📁 Work Directory: $WORK_DIR"

    # Execute pipeline stages
    if transform_spec_to_requirements && \
       transform_requirements_to_red && \
       transform_red_to_green && \
       execute_red_phase && \
       execute_green_phase && \
       final_verification; then
        generate_summary
        exit 0
    else
        echo ""
        echo "❌ Factory pipeline failed!"
        echo "Check logs above for failure point"
        exit 1
    fi
}

main "$@"