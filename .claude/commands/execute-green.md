# Execute Green Phase

Generate minimal implementations from green phase tasks.

**Usage:** `/execute-green <green-phase.md>`

**Output:**
- Implementation files in appropriate directories
- All tests pass after implementation

**Implementation:**
1. Parse GREEN-XXX tasks from green-phase.md
2. For each task:
   - Create implementation file at specified location
   - Generate minimal code using specified component
   - Apply required configuration
3. Execute GREEN-INT integration tasks
4. Execute GREEN-CONFIG configuration tasks
5. Run verification to confirm all tests pass
6. Generate data-plane-current.yaml by listing all Django models with their fields
7. If data-plane-target.yaml exists, run /check-data-plane
8. Report implementation summary

**Constitutional Compliance:**
- Minimal viable implementation (Minimalism)
- Existing components only (Reasonable Defaults)
- Verification through tests (Verification)