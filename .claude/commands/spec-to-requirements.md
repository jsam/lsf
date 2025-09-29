# Spec to Requirements

Transform Layer 1 human specification into Layer 2 requirements and test cases.

**Usage:** `/spec-to-requirements <human-spec.md>`

**Output:**
- requirements.md with REQ-XXX entries
- test-cases.md with TEST-XXX entries
- data-plane-target.yaml with desired entity state (if data models needed)

**Implementation:**
1. Parse user outcomes (OUT-XXX) from human spec
2. For each outcome, derive minimal requirements using:
   - Architecture boundaries for component selection
   - Existing patterns from codebase
   - Django/React defaults
3. Generate test cases covering each requirement
4. If requirements mention data models, generate data-plane-target.yaml:
   - List entities and their fields
   - Define relationships between entities
   - Keep format simple: just entity names, fields, and relations
5. Maintain traceability: OUT-XXX → REQ-XXX → TEST-XXX
6. Run /discriminate-layer2 on output automatically

**Constitutional Compliance:**
- Uses only existing components (Reasonable Defaults)
- Minimal requirements set (Minimalism)
- Agent-optimized output format (Agent-centric)
- Software-only focus (Focus)