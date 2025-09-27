# Green Phase Discrimination

Run all discriminators for Layer 3B (green phase) with aggregated output.

**Usage:** `/discriminate-green <green-phase.md>`

**Purpose:** Validate green phase artifacts for constitutional compliance before implementation.

**Active Discriminators (All 8):**
- Hallucination Prevention: Validates component existence
- Stack Contamination: Enforces Django/React boundaries
- Incomplete Implementation: Ensures complete task specifications
- Context Drift: Maintains traceability to user outcomes
- Test-Code Coupling: Validates real functionality testing
- Pattern Consistency: Enforces codebase conventions
- Dependency Explosion: Prevents new dependency additions
- Over-Engineering: Enforces minimalism in implementations

**Implementation:**
1. Run all 8 discriminators in priority order
2. Stop on first CRITICAL/ERROR violation (fail-fast)
3. Collect all WARNING violations for review
4. Aggregate into single PASS/BLOCKED/WARNING decision
5. Output comprehensive structured report for agent consumption