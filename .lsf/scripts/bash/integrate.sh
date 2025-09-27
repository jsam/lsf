#!/usr/bin/env bash
# Integration Command: Execute full TDD cycle from red through green phases

set -euo pipefail

source "$(dirname "$0")/common.sh"

REPO_ROOT=$(get_repo_root)

usage() {
    cat <<EOF
Usage: $0 [OPTIONS] <phase-files...>

Execute integration across TDD phases with constitutional compliance.

Options:
  -r, --red-only      Execute only RED phase
  -g, --green-only    Execute only GREEN phase
  -f, --full          Execute full RED → GREEN cycle (default)
  -v, --validate      Validate constitutional compliance
  -d, --dry-run       Show commands without executing
  --verbose           Show detailed output

Examples:
  $0 red-phase.md green-phase.md    # Full cycle
  $0 --red-only red-phase.md        # RED phase only
  $0 --green-only green-phase.md    # GREEN phase only
  $0 --validate green-phase.md      # Validate compliance

Environment Variables:
  DRY_RUN=1     Show commands without executing
  VERBOSE=1     Show detailed output
EOF
}

RED_ONLY=false
GREEN_ONLY=false
VALIDATE_ONLY=false
FULL_CYCLE=true

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -r|--red-only)
                RED_ONLY=true
                FULL_CYCLE=false
                shift
                ;;
            -g|--green-only)
                GREEN_ONLY=true
                FULL_CYCLE=false
                shift
                ;;
            -f|--full)
                FULL_CYCLE=true
                shift
                ;;
            -v|--validate)
                VALIDATE_ONLY=true
                shift
                ;;
            -d|--dry-run)
                export DRY_RUN=1
                shift
                ;;
            --verbose)
                export VERBOSE=1
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                echo "ERROR: Unknown option: $1" >&2
                usage >&2
                exit 1
                ;;
            *)
                break
                ;;
        esac
    done

    if [[ $# -eq 0 ]]; then
        echo "ERROR: No phase files provided" >&2
        usage >&2
        exit 1
    fi

    FILES=("$@")
}

validate_environment() {
    echo "🔍 Validating environment..."

    # Check for required files
    local required_files=(
        ".lsf/memory/architecture-boundaries.md"
        ".lsf/memory/environment-setup-checklist.md"
        ".lsf/scripts/bash/red-execute.sh"
        ".lsf/scripts/bash/green-execute.sh"
    )

    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            echo "  ❌ Required file missing: $file" >&2
            return 1
        else
            echo "  ✅ Found: $file"
        fi
    done

    # Check environment setup
    if [[ -f ".lsf/memory/environment-setup-checklist.md" ]]; then
        echo "  📋 Environment setup checklist available"
    fi

    echo "  ✅ Environment validation complete"
}

validate_constitutional_compliance() {
    local file="$1"
    echo "📜 Validating constitutional compliance for $file..."

    local constitution_file=".lsf/memory/constitution.md"
    if [[ ! -f "$constitution_file" ]]; then
        echo "  ⚠️  Constitution file not found, skipping compliance check"
        return 0
    fi

    local violations=0

    # Check for minimalism principle
    local task_count=$(grep -c "^GREEN-\|^RED-" "$file" 2>/dev/null || echo "0")
    if [[ $task_count -gt 20 ]]; then
        echo "  ⚠️  Potential minimalism violation: $task_count tasks (consider breaking down)"
        ((violations++))
    fi

    # Check for existing component usage
    if grep -q "custom\|new framework\|additional dependency" "$file" 2>/dev/null; then
        echo "  ⚠️  Potential boundary violation: custom implementations detected"
        ((violations++))
    fi

    # Check for proper boundaries
    if grep -q "Django.*React\|React.*Django" "$file" 2>/dev/null; then
        echo "  ⚠️  Potential boundary violation: cross-stack references detected"
        ((violations++))
    fi

    # Check for focus on software production
    if grep -q "business\|stakeholder\|marketing" "$file" 2>/dev/null; then
        echo "  ⚠️  Potential focus violation: non-software-production content detected"
        ((violations++))
    fi

    if [[ $violations -eq 0 ]]; then
        echo "  ✅ Constitutional compliance validated"
        return 0
    else
        echo "  ⚠️  Found $violations potential constitutional violations"
        return 1
    fi
}

execute_red_phase() {
    local red_file="$1"
    echo ""
    echo "🔴 ========================================"
    echo "🔴 EXECUTING RED PHASE"
    echo "🔴 ========================================"

    if [[ ! -f "$red_file" ]]; then
        echo "❌ RED phase file not found: $red_file" >&2
        return 1
    fi

    echo "📁 Input: $red_file"

    # Validate constitutional compliance
    if ! validate_constitutional_compliance "$red_file"; then
        echo "⚠️  Constitutional violations detected, continuing with warnings..."
    fi

    # Execute RED phase
    if [[ -x ".lsf/scripts/bash/red-execute.sh" ]]; then
        echo "🚀 Executing RED phase..."
        if ".lsf/scripts/bash/red-execute.sh" "$red_file"; then
            echo "✅ RED phase completed successfully"
            return 0
        else
            echo "❌ RED phase failed" >&2
            return 1
        fi
    else
        echo "❌ RED execute script not found or not executable" >&2
        return 1
    fi
}

execute_green_phase() {
    local green_file="$1"
    echo ""
    echo "💚 ========================================"
    echo "💚 EXECUTING GREEN PHASE"
    echo "💚 ========================================"

    if [[ ! -f "$green_file" ]]; then
        echo "❌ GREEN phase file not found: $green_file" >&2
        return 1
    fi

    echo "📁 Input: $green_file"

    # Validate constitutional compliance
    if ! validate_constitutional_compliance "$green_file"; then
        echo "⚠️  Constitutional violations detected, continuing with warnings..."
    fi

    # Execute GREEN phase
    if [[ -x ".lsf/scripts/bash/green-execute.sh" ]]; then
        echo "🚀 Executing GREEN phase..."
        if ".lsf/scripts/bash/green-execute.sh" "$green_file"; then
            echo "✅ GREEN phase completed successfully"
            return 0
        else
            echo "❌ GREEN phase failed" >&2
            return 1
        fi
    else
        echo "❌ GREEN execute script not found or not executable" >&2
        return 1
    fi
}

run_integration_tests() {
    echo ""
    echo "🧪 ========================================"
    echo "🧪 RUNNING INTEGRATION TESTS"
    echo "🧪 ========================================"

    # Run backend tests
    if [[ -d "tests" ]]; then
        echo "🐍 Running backend tests..."
        if [[ "${DRY_RUN:-0}" == "1" ]]; then
            echo "  [DRY RUN] Would run: pytest tests/ --tb=short"
        else
            if command -v pytest >/dev/null 2>&1; then
                if pytest tests/ --tb=short; then
                    echo "  ✅ Backend tests passed"
                else
                    echo "  ❌ Backend tests failed"
                    return 1
                fi
            else
                echo "  ⚠️  pytest not available, skipping backend tests"
            fi
        fi
    fi

    # Run frontend tests
    if [[ -d "src/frontend" ]]; then
        echo "⚛️  Running frontend tests..."
        if [[ "${DRY_RUN:-0}" == "1" ]]; then
            echo "  [DRY RUN] Would run: npm test"
        else
            if command -v npm >/dev/null 2>&1; then
                cd src/frontend
                if npm test; then
                    echo "  ✅ Frontend tests passed"
                    cd - >/dev/null
                else
                    echo "  ❌ Frontend tests failed"
                    cd - >/dev/null
                    return 1
                fi
            else
                echo "  ⚠️  npm not available, skipping frontend tests"
            fi
        fi
    fi

    # Run integration test script if available
    if [[ -x "tests/run_all_tests_parallelized.py" ]]; then
        echo "🔗 Running parallelized integration tests..."
        if [[ "${DRY_RUN:-0}" == "1" ]]; then
            echo "  [DRY RUN] Would run: tests/run_all_tests_parallelized.py"
        else
            if python3 tests/run_all_tests_parallelized.py; then
                echo "  ✅ Integration tests passed"
            else
                echo "  ❌ Integration tests failed"
                return 1
            fi
        fi
    fi

    echo "✅ All integration tests completed successfully"
}

verify_implementation() {
    echo ""
    echo "✅ ========================================"
    echo "✅ VERIFYING IMPLEMENTATION"
    echo "✅ ========================================"

    local success=true

    # Verify no failing tests remain
    echo "🔍 Checking for failing tests..."
    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "  [DRY RUN] Would verify no failing tests"
    else
        if ! run_integration_tests; then
            echo "  ❌ Tests are still failing"
            success=false
        fi
    fi

    # Verify architectural boundaries
    echo "🏗️  Verifying architectural boundaries..."
    local boundaries_file=".lsf/memory/architecture-boundaries.md"
    if [[ -f "$boundaries_file" ]]; then
        echo "  ✅ Architecture boundaries available for validation"
    else
        echo "  ⚠️  Architecture boundaries file not found"
        success=false
    fi

    # Check for drift from constitutional principles
    echo "📜 Checking constitutional compliance..."
    for file in "${FILES[@]}"; do
        if [[ -f "$file" ]]; then
            if ! validate_constitutional_compliance "$file"; then
                echo "  ⚠️  Constitutional compliance issues in $file"
                # Note: not setting success=false as these are warnings
            fi
        fi
    done

    if $success; then
        echo "✅ Implementation verification completed successfully"
        return 0
    else
        echo "❌ Implementation verification failed"
        return 1
    fi
}

generate_summary() {
    echo ""
    echo "📊 ========================================"
    echo "📊 EXECUTION SUMMARY"
    echo "📊 ========================================"

    echo "📁 Files processed:"
    for file in "${FILES[@]}"; do
        if [[ -f "$file" ]]; then
            echo "  ✅ $file"
        else
            echo "  ❌ $file (not found)"
        fi
    done

    echo ""
    echo "🎯 Phases executed:"
    if $RED_ONLY || $FULL_CYCLE; then
        echo "  🔴 RED phase (failing tests)"
    fi
    if $GREEN_ONLY || $FULL_CYCLE; then
        echo "  💚 GREEN phase (implementations)"
    fi
    if $VALIDATE_ONLY; then
        echo "  📜 Constitutional validation"
    fi

    echo ""
    echo "📈 Next steps:"
    if $RED_ONLY; then
        echo "  • Run GREEN phase to implement passing code"
        echo "  • Verify tests pass with implementations"
    elif $GREEN_ONLY; then
        echo "  • Run integration tests to verify implementations"
        echo "  • Deploy or continue with next feature"
    elif $FULL_CYCLE; then
        echo "  • Review implementation for quality"
        echo "  • Deploy or continue with next feature"
    fi

    echo ""
    echo "🎉 Integration cycle complete!"
}

main() {
    parse_args "$@"

    echo "🚀 ========================================"
    echo "🚀 TDD INTEGRATION EXECUTION"
    echo "🚀 ========================================"

    validate_environment

    # Handle validation-only mode
    if $VALIDATE_ONLY; then
        echo "📜 Constitutional validation mode"
        local validation_success=true
        for file in "${FILES[@]}"; do
            if [[ -f "$file" ]]; then
                if ! validate_constitutional_compliance "$file"; then
                    validation_success=false
                fi
            else
                echo "❌ File not found: $file"
                validation_success=false
            fi
        done

        if $validation_success; then
            echo "✅ All files pass constitutional validation"
            exit 0
        else
            echo "❌ Constitutional validation failed"
            exit 1
        fi
    fi

    # Execute phases based on mode
    local execution_success=true

    if $RED_ONLY; then
        for file in "${FILES[@]}"; do
            if ! execute_red_phase "$file"; then
                execution_success=false
                break
            fi
        done
    elif $GREEN_ONLY; then
        for file in "${FILES[@]}"; do
            if ! execute_green_phase "$file"; then
                execution_success=false
                break
            fi
        done
    elif $FULL_CYCLE; then
        # Find red and green files
        local red_files=()
        local green_files=()

        for file in "${FILES[@]}"; do
            if [[ "$file" == *"red"* ]]; then
                red_files+=("$file")
            elif [[ "$file" == *"green"* ]]; then
                green_files+=("$file")
            fi
        done

        # Execute RED phase first
        for file in "${red_files[@]}"; do
            if ! execute_red_phase "$file"; then
                execution_success=false
                break
            fi
        done

        # Execute GREEN phase if RED succeeded
        if $execution_success; then
            for file in "${green_files[@]}"; do
                if ! execute_green_phase "$file"; then
                    execution_success=false
                    break
                fi
            done
        fi
    fi

    # Verify implementation if execution succeeded
    if $execution_success; then
        if ! verify_implementation; then
            execution_success=false
        fi
    fi

    # Generate summary
    generate_summary

    if $execution_success; then
        echo "🎉 Integration execution completed successfully!"
        exit 0
    else
        echo "❌ Integration execution failed!"
        exit 1
    fi
}

main "$@"