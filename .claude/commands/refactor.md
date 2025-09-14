---
description: Improve internal code structure without changing observable behavior while keeping tests green. Applies systematic refactoring techniques for maintainability and performance.
---

Given the refactoring scope and techniques provided as an argument, do this:

1. Run `.lsf/scripts/bash/refactor.sh --json "$ARGUMENTS"` from repo root and parse JSON for REFACTOR_SCOPE, AVAILABLE_TECHNIQUES, BASELINE_METRICS, and SAFETY_STATUS. All file paths must be absolute.
2. Parse refactoring parameters from arguments:
   - Extract scope (specific files, directories, or full codebase)
   - Extract requested techniques (extract_method, rename_variable, remove_duplication, simplify_conditions, etc.)
   - Extract safety level (conservative, moderate, aggressive)
   - Extract performance targets and quality goals
3. Establish refactoring baseline:
   - Run full test suite to ensure green status (mandatory prerequisite)
   - Collect code metrics (complexity, duplication, coverage, performance)
   - Document current architecture and dependencies
   - Create refactoring checkpoint for rollback if needed
4. Execute systematic refactoring:
   - **Code Structure Improvements**:
     * Extract methods from large functions
     * Simplify complex conditional logic
     * Remove code duplication and consolidate similar patterns
     * Improve variable and function naming for clarity
     * Optimize import statements and dependency organization
   - **Architecture Refinements**:
     * Strengthen module boundaries and interfaces
     * Reduce coupling between components
     * Improve cohesion within modules
     * Eliminate circular dependencies
     * Enhance error handling patterns
   - **Performance Optimizations** (when requested):
     * Optimize data structures and algorithms
     * Reduce memory allocation and garbage collection
     * Improve I/O and database access patterns
     * Cache frequently accessed data
     * Parallelize independent operations
5. Apply refactoring techniques incrementally:
   - Make small, focused changes one at a time
   - Run tests after each change to maintain green status
   - Commit each successful refactoring step
   - Roll back immediately if tests fail
   - Document rationale for each significant change
6. Validate refactoring results:
   - Ensure all tests remain green (non-negotiable requirement)
   - Verify no behavioral changes in observable functionality
   - Confirm metrics improvements (reduced complexity, less duplication)
   - Check performance targets are met or improved
   - Validate architecture improvements achieved goals
7. Generate refactoring report:
   - Document applied techniques and their impact
   - Compare before/after metrics and performance
   - Highlight architectural improvements and benefits
   - Note any risks or areas requiring monitoring
   - Provide maintenance recommendations
8. Report results with refactoring summary, metrics comparison, test status, and code quality improvements.

Context for refactoring: $ARGUMENTS

Note: This command systematically improves code quality and maintainability while preserving functionality. It enforces the discipline of keeping tests green throughout the refactoring process and provides measurable improvements to code metrics.