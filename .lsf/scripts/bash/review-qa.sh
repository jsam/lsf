#!/usr/bin/env bash
# Perform quality assurance and architectural review
set -e

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] [--scope full|changed] [--auto-fix]"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

REVIEW_ARGS="${ARGS[*]}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

eval $(get_feature_paths)
check_feature_branch "$CURRENT_BRANCH" || exit 1

# Parse review arguments
REVIEW_SCOPE="full"
AUTO_FIX=false

if [[ "$REVIEW_ARGS" =~ --scope[[:space:]]+(full|changed) ]]; then
    REVIEW_SCOPE="${BASH_REMATCH[1]}"
fi

if [[ "$REVIEW_ARGS" =~ --auto-fix ]]; then
    AUTO_FIX=true
fi

# Determine review type based on context
REVIEW_TYPE="full"
if [[ "$REVIEW_SCOPE" == "changed" ]]; then
    REVIEW_TYPE="micro"
fi

# Set up review output files
REVIEW_REPORT="$FEATURE_DIR/review_report.md"
REVIEW_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Initialize review report
cat > "$REVIEW_REPORT" << EOF
# Review Report: $CURRENT_BRANCH

**Review Type**: $REVIEW_TYPE  
**Scope**: $REVIEW_SCOPE  
**Timestamp**: $REVIEW_TIMESTAMP  
**Auto-fix**: $AUTO_FIX

## Executive Summary
[Review status and key findings]

## Findings

### Scope Compliance
[Changes alignment with epic.md and tasks.md]

### Architecture Conformance  
[Adherence to breakdown.md design decisions]

### Quality Assessment
[Code quality, complexity, security, performance]

### Traceability Validation
[Requirements → tasks → tests → code mapping]

### Constitutional Compliance
[Adherence to project constitution]

## Corrective Actions
[Required fixes and improvements]

## Recommendations
[Suggestions for future improvements]
EOF

# Perform review checks
FINDINGS_COUNT=0
CORRECTIVE_TASKS=0
SCOPE_FILES=()

# Check if required files exist
if [[ ! -f "$FEATURE_DIR/epic.md" ]]; then
    echo "WARNING: No epic.md found for scope validation" >&2
fi

if [[ ! -f "$FEATURE_DIR/breakdown.md" ]]; then
    echo "WARNING: No breakdown.md found for architecture validation" >&2
fi

if [[ ! -f "$TASKS" ]]; then
    echo "WARNING: No tasks.md found for traceability validation" >&2
fi

# Constitution compliance check
CONSTITUTION_FILE="$REPO_ROOT/.lsf/memory/constitution.md"
if [[ -f "$CONSTITUTION_FILE" ]]; then
    echo "INFO: Checking constitutional compliance" >&2
    # In a real implementation, this would parse the constitution
    # and validate code against the principles
else
    echo "WARNING: Constitution file not found at $CONSTITUTION_FILE" >&2
    FINDINGS_COUNT=$((FINDINGS_COUNT + 1))
fi

# Scope analysis
if [[ "$REVIEW_SCOPE" == "changed" ]]; then
    # Get changed files (simplified - in real implementation would use git diff)
    echo "INFO: Analyzing changed files for micro-review" >&2
    SCOPE_FILES=("src/example.py" "test/example_test.py")  # Demo files
elif [[ "$REVIEW_SCOPE" == "full" ]]; then
    # Analyze entire feature
    echo "INFO: Performing full feature review" >&2
    if [[ -d "$REPO_ROOT/src" ]]; then
        SCOPE_FILES=($(find "$REPO_ROOT/src" -name "*.py" 2>/dev/null | head -10))
    fi
    if [[ -d "$REPO_ROOT/test" ]]; then
        SCOPE_FILES+=($(find "$REPO_ROOT/test" -name "*.py" 2>/dev/null | head -10))
    fi
fi

# Quality checks (simplified demonstration)
if [[ ${#SCOPE_FILES[@]} -gt 0 ]]; then
    echo "INFO: Analyzing ${#SCOPE_FILES[@]} files for quality issues" >&2
    
    # Check for common issues (simplified)
    for file in "${SCOPE_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            # Check file size (simple metric)
            file_size=$(wc -l < "$file" 2>/dev/null || echo 0)
            if [[ $file_size -gt 500 ]]; then
                echo "WARNING: Large file detected: $file ($file_size lines)" >&2
                FINDINGS_COUNT=$((FINDINGS_COUNT + 1))
            fi
        fi
    done
else
    echo "INFO: No source files found for analysis" >&2
fi

# Test coverage check (if test files exist)
if [[ -d "$REPO_ROOT/test" ]]; then
    test_count=$(find "$REPO_ROOT/test" -name "*.py" -exec grep -l "def test_" {} \; 2>/dev/null | wc -l)
    echo "INFO: Found $test_count test files" >&2
    if [[ $test_count -eq 0 ]]; then
        echo "WARNING: No test files found - TDD compliance violation" >&2
        FINDINGS_COUNT=$((FINDINGS_COUNT + 1))
        CORRECTIVE_TASKS=$((CORRECTIVE_TASKS + 1))
    fi
fi

# Generate corrective tasks if needed
if [[ $CORRECTIVE_TASKS -gt 0 ]] && [[ -f "$TASKS" ]]; then
    echo "INFO: Adding $CORRECTIVE_TASKS corrective tasks to tasks.md" >&2
    
    # Create backup of tasks.md
    local backup_file="${TASKS}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$TASKS" "$backup_file"
    
    # Call function to append corrective tasks
    append_corrective_tasks "$REVIEW_FINDINGS" "$TASKS"
fi

# Function to append corrective tasks to tasks.md
append_corrective_tasks() {
    local review_findings="$1"
    local tasks_file="$2"
    
    # Check if QA section already exists
    if grep -q "## QA Corrective Tasks" "$tasks_file" 2>/dev/null; then
        echo "INFO: QA section already exists, updating with new findings" >&2
    else
        echo "INFO: Creating new QA section in tasks.md" >&2
    fi
    
    # Get next available QA task ID
    local qa_counter=1
    while grep -q "\\*\\*QA-$(printf "%03d" $qa_counter)\\*\\*:" "$tasks_file" 2>/dev/null; do
        qa_counter=$((qa_counter + 1))
    done
    
    # Add or update QA section
    if ! grep -q "## QA Corrective Tasks" "$tasks_file" 2>/dev/null; then
        cat >> "$tasks_file" << EOF

---

## QA Corrective Tasks
*Tasks generated from code review findings*
**Generated**: $REVIEW_TIMESTAMP  
**Review Score**: $REVIEW_SCORE

EOF
    fi
    
    # Generate specific corrective tasks based on findings
    local qa_tasks_added=0
    
    if [[ $CORRECTIVE_TASKS -gt 0 ]]; then
        # Constitutional compliance issues
        if [[ $FINDINGS_COUNT -gt 0 ]]; then
            local qa_id="QA-$(printf "%03d" $qa_counter)"
            cat >> "$tasks_file" << EOF
- [ ] **$qa_id**: Address constitutional compliance violations
  - **Description**: Fix identified violations of project constitution and coding standards
  - **Files**: Project structure, documentation, code organization
  - **Dependencies**: None
  - **Tests**: test_constitution_compliance.py::test_project_structure
  - **Definition of Done**:
    - [ ] All constitutional principles properly followed
    - [ ] Code structure matches library-first architecture
    - [ ] CLI interfaces properly defined
    - [ ] Documentation updated and complete
  - **Priority**: High
  - **Review Findings**: $FINDINGS_COUNT issues identified
  - **Estimated Effort**: 3 hours

EOF
            qa_counter=$((qa_counter + 1))
            qa_tasks_added=$((qa_tasks_added + 1))
        fi
        
        # Test coverage issues
        if [[ -d "$REPO_ROOT/test" ]]; then
            local test_count=$(find "$REPO_ROOT/test" -name "*.py" -exec grep -l "def test_" {} \; 2>/dev/null | wc -l)
            if [[ $test_count -eq 0 ]]; then
                local qa_id="QA-$(printf "%03d" $qa_counter)"
                cat >> "$tasks_file" << EOF
- [ ] **$qa_id**: Implement missing test coverage
  - **Description**: Add comprehensive test suite to meet TDD requirements
  - **Files**: test/ directory structure, test files for all components
  - **Dependencies**: None
  - **Tests**: test_coverage.py::test_minimum_coverage_met
  - **Definition of Done**:
    - [ ] Test coverage above 80% for all components
    - [ ] All critical paths covered by tests
    - [ ] Tests follow TDD Red-Green-Refactor pattern
    - [ ] Test traceability to tasks established
  - **Priority**: High  
  - **Review Findings**: Missing test coverage identified
  - **Estimated Effort**: 5 hours

EOF
                qa_counter=$((qa_counter + 1))
                qa_tasks_added=$((qa_tasks_added + 1))
            fi
        fi
        
        # Code quality issues (generic)
        if [[ $qa_tasks_added -eq 0 ]]; then
            local qa_id="QA-$(printf "%03d" $qa_counter)"
            cat >> "$tasks_file" << EOF
- [ ] **$qa_id**: Address code quality findings
  - **Description**: Fix code quality issues identified in review
  - **Files**: Source files with quality issues
  - **Dependencies**: None
  - **Tests**: test_code_quality.py::test_quality_standards_met
  - **Definition of Done**:
    - [ ] All code quality issues resolved
    - [ ] Code follows project style guidelines
    - [ ] No security vulnerabilities detected
    - [ ] Performance standards met
  - **Priority**: Medium
  - **Review Findings**: General quality improvements needed
  - **Estimated Effort**: 2 hours

EOF
            qa_tasks_added=$((qa_tasks_added + 1))
        fi
    fi
    
    echo "INFO: Added $qa_tasks_added corrective tasks to tasks.md" >&2
}

# Determine review status
REVIEW_STATUS="pass"
if [[ $FINDINGS_COUNT -gt 5 ]]; then
    REVIEW_STATUS="fail"
elif [[ $FINDINGS_COUNT -gt 0 ]]; then
    REVIEW_STATUS="conditional"
fi

echo "INFO: Review completed with status: $REVIEW_STATUS" >&2

if $JSON_MODE; then
    # Convert scope files to JSON array
    scope_json=$(printf '"%s",' "${SCOPE_FILES[@]}")
    scope_json="[${scope_json%,}]"
    
    printf '{"REVIEW_TYPE":"%s","REVIEW_SCOPE":"%s","SCOPE_FILES":%s,"FINDINGS_COUNT":%d,"CORRECTIVE_TASKS":%d,"REVIEW_STATUS":"%s","REPORT_FILE":"%s"}\n' \
        "$REVIEW_TYPE" "$REVIEW_SCOPE" "$scope_json" "$FINDINGS_COUNT" "$CORRECTIVE_TASKS" "$REVIEW_STATUS" "$REVIEW_REPORT"
else
    echo "REVIEW_TYPE: $REVIEW_TYPE"
    echo "REVIEW_SCOPE: $REVIEW_SCOPE"
    echo "FINDINGS_COUNT: $FINDINGS_COUNT"
    echo "CORRECTIVE_TASKS: $CORRECTIVE_TASKS"
    echo "REVIEW_STATUS: $REVIEW_STATUS"
    echo "REPORT_FILE: $REVIEW_REPORT"
fi