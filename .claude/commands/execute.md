# Execute Phase

Auto-detect and execute appropriate phase (red or green).

**Usage:** `/execute <phase-file>`

**Auto-Detection:**
- `*red-phase.md` → Execute RED phase (failing tests)
- `*green-phase.md` → Execute GREEN phase (implementations)

**Implementation:**
1. Detect phase type from filename/content
2. Route to appropriate execution:
   - RED: Use red-execute.sh script
   - GREEN: Use green-execute.sh script
3. Run appropriate verification
4. Report execution summary

**Integration:**
- Calls existing .lsf/scripts/bash/red-execute.sh
- Calls existing .lsf/scripts/bash/green-execute.sh
- Maintains all constitutional compliance from underlying scripts

**Constitutional Compliance:**
- Single responsibility (Boundaries)
- Reuses existing scripts (Reasonable Defaults)
- Verification at each step (Verification)