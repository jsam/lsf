# Execute Red Phase

Generate failing test implementations from red phase tasks.

**Usage:** `/execute-red <red-phase.md>`

**Output:**
- Test files in appropriate directories
- All tests fail with expected reasons

**Implementation:**
1. Parse RED-XXX tasks from red-phase.md
2. For each task:
   - Create test file at specified location
   - Generate failing test with correct framework
   - Ensure test fails for expected reason
3. Execute RED-SETUP infrastructure tasks
4. Run verification to confirm all tests fail
5. Report test failure summary

**Constitutional Compliance:**
- Test-first development (Verification)
- Framework defaults (Reasonable Defaults)
- Clean test boundaries (Boundaries)