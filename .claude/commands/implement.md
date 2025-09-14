---
description: Execute single-agent implementation using TDD loop and automatic quality checks. Provides foundation for reliable test-driven development workflow.
---

Given the implementation selector and options provided as an argument, do this:

1. Run `.lsf/scripts/bash/implement-single.sh --json "$ARGUMENTS"` from repo root and parse JSON for EXECUTION_ID, TASK_SELECTION, BRANCH_INFO, and WORKFLOW_STATUS. All file paths must be absolute.
2. Parse implementation parameters from arguments:
   - Extract task selector (single ID, comma-separated IDs, or range)
   - Extract execution mode (sequential with checkpoints)
   - Extract quality gate settings (automatic or manual)
3. Execute single-agent TDD workflow:
   - Validate selected tasks exist and dependencies are satisfied
   - Verify task ordering follows dependency chain
   - Ensure feature branch is properly set up
   - Initialize single-agent workspace with task queue
4. Execute TDD implementation loop:
   - For each task in sequence:
     * Validate task prerequisites are met
     * Run relevant tests (Red phase - should fail initially)
     * Implement minimum code to pass tests (Green phase)
     * Run full test suite to ensure no regressions
     * Execute refactor phase with test stability checks
     * Run quality gates and generate corrective tasks if needed
     * Update task status and commit changes with traceability
5. Quality assurance and validation:
   - Validate all completed tasks meet Definition of Done
   - Run comprehensive test suite for regression detection
   - Execute constitutional compliance checks
   - Update tasks.md with completion status and metadata
   - Generate implementation report with metrics and recommendations
6. Handle error conditions:
   - Test failures and debugging guidance
   - Task dependency violations
   - Quality gate failures with corrective actions
   - Constitutional compliance violations
   - Git operation failures
7. Report results with execution summary, completed tasks, test status, quality gate results, and readiness for /review phase.

Context for implementation: $ARGUMENTS

Note: This command provides a reliable single-agent TDD workflow foundation that enforces quality through automated testing and constitutional compliance. Designed to be extended to multi-agent coordination in future iterations.