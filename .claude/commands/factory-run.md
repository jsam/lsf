# Factory Run

Execute complete software factory pipeline from human spec to working code.

**Usage:** `/factory-run <human-spec.md>`

**Pipeline Stages:**
1. **Layer 1→2**: /spec-to-requirements
2. **Discriminate**: /discriminate-layer2
3. **Complexity Gate**: /complexity-gate (determines TDD vs Seed path)

**TDD Path (default for low uncertainty):**
4a. **Layer 2→3A**: /requirements-to-red
5a. **Discriminate**: /discriminate-red
6a. **Layer 3A→3B**: /red-to-green
7a. **Discriminate**: /discriminate-green
8a. **Execute Tests**: /execute-red
9a. **Execute Code**: /execute-green

**Seed Path (when high uncertainty detected):**
4b. **Implement First**: /seed-implementation
5b. **Extract Tests**: /extract-tests (integration-first)
6b. **Verify Tests**: Run extracted tests

10. **Final Verification**: Run all tests
11. **Data Plane Check**: /check-data-plane (if applicable)

**Fail-Fast Behavior:**
- Stops on first discrimination failure
- Stops on execution errors
- Reports failure point and reason

**Output:**
- Working, tested implementation
- Full traceability from outcomes to code
- Execution summary report

**Constitutional Compliance:**
- Full automation (Focus)
- Minimal context per stage (Context Efficiency)
- Verification at every stage (Verification)
- No drift from outcomes (Drift Detection)