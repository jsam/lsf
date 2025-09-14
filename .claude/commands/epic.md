---
description: Create or update the feature epic with human-readable requirements (the what and why). Replaces spec.md with clearer epic-focused structure.
---

Given the epic description provided as an argument, do this:

1. Run the script `.lsf/scripts/bash/epic.sh --json "$ARGUMENTS"` from repo root and parse its JSON output for BRANCH_NAME and EPIC_FILE. All file paths must be absolute.
2. Load `.lsf/templates/epic-template.md` to understand required sections.
3. Write the epic to EPIC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings.
4. Report completion with branch name, epic file path, and readiness for the /breakdown phase.

Note: The /epic command creates the feature epic that will be consumed by /breakdown to generate technical plans and tasks. Focus on user value and business requirements, avoiding technical implementation details.