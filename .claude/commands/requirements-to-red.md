# Requirements to Red Phase

Transform Layer 2 requirements/test cases into Layer 3A red phase tasks.

**Usage:** `/requirements-to-red <requirements.md> <test-cases.md>`

**Output:**
- red-phase.md with RED-XXX tasks

**Implementation:**
1. Parse TEST-XXX entries from test-cases.md
2. For each test case:
   - Create RED-XXX task for failing test implementation
   - Map test type to appropriate framework (pytest/Vitest)
   - Determine expected failure reason
   - Generate verification command
3. Add RED-SETUP tasks for infrastructure needs
4. Maintain traceability: TEST-XXX → REQ-XXX → OUT-XXX
5. Run /discriminate-red on output automatically

**Constitutional Compliance:**
- Test-first approach (Verification)
- Framework defaults (Reasonable Defaults)
- Clean test boundaries (Boundaries)
- Minimal test scope (Minimalism)