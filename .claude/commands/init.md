---
description: Initialize project constitution and governance structure. Sets up constitutional framework for single-agent TDD workflow development.
---

Given the project initialization parameters provided as an argument, do this:

1. Run `.lsf/scripts/bash/init.sh --json "$ARGUMENTS"` from repo root and parse JSON for PROJECT_NAME, CONSTITUTION_DIR, CONSTITUTION_FILE, and SETUP_STATUS. All file paths must be absolute.
2. Parse initialization parameters from arguments:
   - Extract project name (if provided, otherwise use repository name)
   - Extract constitution version (defaults to 3.0.0 - Single-Agent TDD Workflow)
   - Extract any custom constitutional principles or amendments
3. Execute constitution initialization workflow:
   - Create specs/constitution/ directory structure
   - Load constitution template from `.lsf/memory/constitution.md`
   - Replace placeholders with project-specific details:
     * [PROJECT_NAME] with actual project name
     * [CONSTITUTION_VERSION] with version number
     * [RATIFICATION_DATE] with current date
     * [LAST_AMENDED_DATE] with current date
   - Generate constitution.md in specs/constitution/
   - Create constitution_update_checklist.md for governance
   - Set up governance tracking and compliance framework
4. Initialize project governance structure:
   - Create specs/constitution/amendments/ directory for future changes
   - Generate initial governance report
   - Set up constitutional compliance validation
   - Document amendment process and approval workflow
5. Validate constitution setup:
   - Verify all constitutional principles are properly defined
   - Ensure governance structure is complete
   - Confirm constitutional compliance framework is active
   - Test amendment process documentation
6. Report completion with:
   - Constitution directory path
   - Constitution file location
   - Governance framework status
   - Next steps for team adoption

Context for initialization: $ARGUMENTS

Note: This command establishes the constitutional foundation for the single-agent TDD workflow, ensuring consistent development practices and quality standards across the project lifecycle.