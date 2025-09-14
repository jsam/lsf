---
description: Transform epic into actionable technical plan and ordered task list. Single-agent sequential task generation with TDD workflow integration.
---

Given the technical context provided as an argument, do this:

1. Run `.lsf/scripts/bash/breakdown.sh --json "$ARGUMENTS"` from repo root and parse JSON for EPIC_FILE, BREAKDOWN_FILE, TASKS_FILE, SPECS_DIR, BRANCH. All file paths must be absolute.
2. Read and analyze the epic file to understand:
   - Feature requirements and user stories
   - Functional and non-functional requirements  
   - Success criteria and acceptance criteria
   - Technical constraints or dependencies mentioned
   - Clear boundaries between user stories and interfaces
3. Read the constitution at `.lsf/memory/constitution.md` to understand constitutional requirements.
4. Execute the breakdown workflow:
   - Load `.lsf/templates/breakdown-template.md`
   - Set Input path to EPIC_FILE
   - Run the Execution Flow steps for technical blueprint generation
   - The template is self-contained and executable
   - Follow error handling and gate checks as specified
   - Breakdown the epic down and generate user stories in stories.md
   - Generate technical architecture decision in breakdown.md
   - Generate technical boundaries with API/interfaces in boundaries/ folder
   - Generate ordered, executable tasks in tasks.md with:
     * Stable IDs (P1-001, P1-002, etc.)
     * Dependencies and sequential execution order
     * Single-agent workflow support
     * TDD enforcement (tests before implementation)
     * Clear Definition of Done for each task
   - Incorporate user-provided technical context: $ARGUMENTS
   - Update Progress Tracking as you complete each phase
5. Verify execution completed:
   - Check both breakdown.md and tasks.md were generated
   - Ensure tasks follow dependency ordering
   - Confirm constitutional compliance
   - Validate single-agent sequential execution is feasible
6. Report results with branch name, file paths, task count, and readiness for /test phase.

Note: This command bridges the gap between business requirements (epic) and implementation (tasks), providing both architectural guidance and executable work items for reliable single-agent development workflow.