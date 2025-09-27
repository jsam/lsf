# Layer 2 Discrimination

Run appropriate discriminators for Layer 2 (requirements and test cases) with aggregated output.

**Usage:** `/discriminate-layer2 <requirements.md> <test-cases.md>`

**Purpose:** Validate Layer 2 artifacts for constitutional compliance before Layer 3 derivation.

**Active Discriminators:**
- Context Drift: Maintains link to user outcomes
- Dependency Explosion: Ensures requirements use existing components
- Over-Engineering Prevention: Prevents requirement bloat

**Implementation:**
1. Run drift-check on both files to validate traceability to OUT-XXX
2. Run dependency-check to ensure existing component usage
3. Run overeng-check to prevent complexity in requirements
4. Aggregate results into single PASS/BLOCKED decision
5. Output structured report for agent consumption with specific violations and fixes