# Red to Green Phase

Transform Layer 3A red phase into Layer 3B green phase implementation tasks.

**Usage:** `/red-to-green <red-phase.md>`

**Output:**
- green-phase.md with GREEN-XXX tasks

**Implementation:**
1. Parse RED-XXX tasks from red-phase.md
2. If data-plane-target.yaml exists, use as reference for model structures
3. For each RED task:
   - Map to minimal implementation using architecture boundaries
   - Follow component decision tree (built-in → existing → configure)
   - Generate GREEN-XXX implementation task
   - Add configuration and integration tasks
4. Check for secret dependencies
5. Maintain traceability: RED-XXX → REQ-XXX → OUT-XXX
6. Run /discriminate-green on output automatically

**Constitutional Compliance:**
- Existing components only (Reasonable Defaults)
- Minimal to pass tests (Minimalism)
- Clean implementation boundaries (Boundaries)
- Executable verification (Verification)