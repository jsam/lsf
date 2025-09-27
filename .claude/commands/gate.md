# Discrimination Gate

Automatically run appropriate discriminators based on file type with unified output.

**Usage:** `/gate <phase-file>`

**Purpose:** Single command to run correct discriminator ensemble for any TDD phase file.

**Auto-Detection Logic:**
- `*requirements.md` + `*test-cases.md` → Layer 2 discrimination
- `*red-phase.md` → Red phase discrimination
- `*green-phase.md` → Green phase discrimination
- Other files → Basic constitutional checks (drift, overeng)

**Implementation:**
1. Detect file type and phase from filename/content
2. Route to appropriate discriminate-* command
3. Return unified PASS/BLOCKED/WARNING status
4. Output agent-optimized report with:
   - Overall status
   - Critical violations (if any)
   - Suggested fixes
   - Next steps for agent

**Agent Integration:**
This command is designed for agent-to-agent validation. Output format optimized for automated consumption and decision-making in TDD pipeline.