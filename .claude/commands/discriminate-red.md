# Red Phase Discrimination

Run appropriate discriminators for Layer 3A (red phase) with aggregated output.

**Usage:** `/discriminate-red <red-phase.md>`

**Purpose:** Validate red phase artifacts for constitutional compliance before test implementation.

**Active Discriminators:**
- Test-Code Coupling: Ensures tests fail for correct reasons
- Stack Contamination: Enforces correct test framework boundaries
- Hallucination Prevention: Validates test targets exist/will exist

**Implementation:**
1. Run coupling-check to validate proper test failure patterns
2. Run stack-check to enforce pytest/Vitest boundaries
3. Run hallucination-check to verify test target validity
4. Aggregate results into single PASS/BLOCKED decision
5. Output structured report for agent consumption with test-specific violations