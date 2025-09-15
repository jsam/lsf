#!/usr/bin/env bash
# Create or update the feature epic with human-readable requirements
set -e

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] <feature_description>"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Usage: $0 [--json] <feature_description>" >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Check if we're already on a feature branch or need to create one
CURRENT_BRANCH=$(get_current_branch)
if check_feature_branch "$CURRENT_BRANCH" 2>/dev/null; then
    # We're on a feature branch, use existing structure
    eval $(get_feature_paths)
    BRANCH_NAME="$CURRENT_BRANCH"
    FEATURE_NUM=$(echo "$BRANCH_NAME" | grep -o '^[0-9]\+' || echo "000")
else
    # Create new feature branch (similar to create-new-feature.sh)
    REPO_ROOT=$(get_repo_root)
    SPECS_DIR="$REPO_ROOT/specs"
    mkdir -p "$SPECS_DIR"
    
    # Find next feature number
    HIGHEST=0
    if [ -d "$SPECS_DIR" ]; then
        for dir in "$SPECS_DIR"/*; do
            [ -d "$dir" ] || continue
            dirname=$(basename "$dir")
            number=$(echo "$dirname" | grep -o '^[0-9]\+' || echo "0")
            number=$((10#$number))
            if [ "$number" -gt "$HIGHEST" ]; then HIGHEST=$number; fi
        done
    fi
    
    NEXT=$((HIGHEST + 1))
    FEATURE_NUM=$(printf "%03d" "$NEXT")
    
    # Create branch name from description
    BRANCH_NAME=$(echo "$FEATURE_DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
    WORDS=$(echo "$BRANCH_NAME" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//')
    BRANCH_NAME="${FEATURE_NUM}-${WORDS}"
    
    git checkout -b "$BRANCH_NAME"
    
    # Set up paths
    eval $(get_feature_paths)
    mkdir -p "$FEATURE_DIR"
fi

# Set up epic file path (replaces spec.md)
EPIC_FILE="$FEATURE_DIR/epic.md"

# Copy epic template if it doesn't exist
TEMPLATE="$REPO_ROOT/.lsf/templates/epic-template.md"
if [ ! -f "$EPIC_FILE" ] && [ -f "$TEMPLATE" ]; then 
    cp "$TEMPLATE" "$EPIC_FILE"
elif [ ! -f "$EPIC_FILE" ]; then
    # Create basic epic structure if no template exists
    cat > "$EPIC_FILE" << 'EOF'
# Epic: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Overview
[Feature description and business value]

## User Stories
[Key user scenarios and interactions]

## Functional Requirements
[Specific capabilities the system must provide]

## Success Criteria
[Measurable outcomes that define completion]

## Constraints
[Business, technical, or regulatory limitations]
EOF
fi

if $JSON_MODE; then
    printf '{"BRANCH_NAME":"%s","EPIC_FILE":"%s","FEATURE_NUM":"%s","FEATURE_DIR":"%s"}\n' "$BRANCH_NAME" "$EPIC_FILE" "$FEATURE_NUM" "$FEATURE_DIR"
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "EPIC_FILE: $EPIC_FILE"
    echo "FEATURE_NUM: $FEATURE_NUM"
    echo "FEATURE_DIR: $FEATURE_DIR"
fi