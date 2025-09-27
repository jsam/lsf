# Factory Run

Execute complete software factory pipeline from human spec to working code.

**Usage:** `/factory-run <human-spec.md>`

**Pipeline Stages:**
1. **Layer 1→2**: /spec-to-requirements
2. **Discriminate**: /discriminate-layer2
3. **Layer 2→3A**: /requirements-to-red
4. **Discriminate**: /discriminate-red
5. **Layer 3A→3B**: /red-to-green
6. **Discriminate**: /discriminate-green
7. **Execute Tests**: /execute-red
8. **Execute Code**: /execute-green
9. **Final Verification**: Run all tests

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