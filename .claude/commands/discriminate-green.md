# Green Phase Discrimination

Run all discriminators for Layer 3B (green phase) with aggregated output.

**Usage:** `/discriminate-green <green-phase.md>`

**Purpose:** Validate green phase artifacts for constitutional compliance before implementation.

**Active Discriminators (All 9):**
- Hallucination Prevention: Validates component existence
- Stack Contamination: Enforces Django/React boundaries
- Incomplete Implementation: Ensures complete task specifications
- Context Drift: Maintains traceability to user outcomes
- Test-Code Coupling: Validates real functionality testing (no mocked E2E)
- Pattern Consistency: Enforces codebase conventions
- Dependency Explosion: Prevents new dependency additions
- Over-Engineering: Enforces minimalism in implementations
- E2E-First Compliance: Validates test ratio and real service usage

**Implementation:**
1. Run all 9 discriminators in priority order
2. Stop on first CRITICAL/ERROR violation (fail-fast)
3. Validate test iteration loop completion:
   - All tests pass: `python3 tests/run_all_tests_parallelized.py --json-output` shows failed == 0
4. Validate registry promotion:
   - New tests moved to baseline category
   - New category cleared for next iteration
5. Collect all WARNING violations for review
6. Aggregate into single PASS/BLOCKED/WARNING decision
7. Output comprehensive structured report for agent consumption