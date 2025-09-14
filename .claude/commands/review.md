---
description: Perform quality assurance and architectural review. Supports both micro-reviews (during implementation) and full reviews (feature completion) with constitutional compliance checking.
---

Given the review scope and options provided as an argument, do this:

1. Run `.lsf/scripts/bash/review-qa.sh --json "$ARGUMENTS"` from repo root and parse JSON for REVIEW_TYPE, SCOPE_FILES, FINDINGS_COUNT, and CORRECTIVE_TASKS. All file paths must be absolute.
2. Parse review parameters from arguments:
   - Extract review scope (full or changed)
   - Extract auto-fix option (boolean)
   - Extract specific files or components to review
   - Determine review mode based on context
3. Execute quality assurance workflow:
   - **Scope Analysis**: Changes align with epic.md and tasks.md
   - **Architecture Review**: Conformance to breakdown.md (layering, boundaries, dependency rules)
   - **Quality Assessment**: 
     * Static analysis and complexity metrics
     * Code duplication and maintainability
     * Security and performance considerations
     * Error handling and logging adequacy
     * Documentation completeness
   - **Traceability Validation**: Requirements → tasks → tests → code
   - **Constitutional Compliance**: Adherence to .lsf/memory/constitution.md principles
4. Review mode execution:
   - **Incremental Review Mode** (--scope changed):
     * Focus on current diff/branch changes in single-agent context
     * Quick architectural conformance check
     * Fast turnaround for continuous quality feedback
     * Generate immediate corrective actions for task-level issues
   - **Full Review Mode** (default):
     * Comprehensive analysis of entire feature for single-agent workflow
     * Complete quality gate evaluation
     * Thorough constitutional compliance check
     * Detailed findings and improvement recommendations
5. Generate review report:
   - Create review_report.md with structured findings
   - Categorize issues by severity (critical, major, minor)
   - Organize findings by type (scope, architecture, quality, traceability)
   - Provide specific recommendations and fix guidance
   - Generate corrective tasks for significant issues
6. Handle review outcomes:
   - **Pass**: Confirm quality standards met, approve progression
   - **Conditional Pass**: Minor issues noted, can proceed with monitoring
   - **Fail**: Critical issues found, implementation must be corrected
   - **Auto-fix Applied**: Safe fixes implemented automatically
7. Integrate with task management:
   - Append corrective tasks to tasks.md with unique IDs
   - Mark corrective tasks with "QA-" prefix and appropriate priority
   - Include clear Definition of Done for each corrective task
   - Update task dependencies to reflect review requirements
8. Report results with review status, findings summary, corrective task count, and next steps.

Context for review: $ARGUMENTS

Note: This command ensures code quality and architectural integrity through systematic review processes. It acts as both a gatekeeper for feature completion and a continuous quality advisor during implementation.