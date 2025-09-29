# Check Data Plane

Compare current vs target data model state.

**Usage:** `/check-data-plane`

**Purpose:** Verify that implemented data models match the target specification.

**Implementation:**
1. Read data-plane-target.yaml (if exists, otherwise skip)
2. Read data-plane-current.yaml (if exists, otherwise skip)
3. Compare entities, fields, and relationships
4. Report differences:
   - Missing entities in current
   - Missing fields in existing entities
   - Extra entities not in target (warning only)
   - Relationship mismatches

**Output:**
- PASS: Current matches target
- WARN: Minor differences (extra fields OK)
- FAIL: Missing required entities/fields

**Example YAML Format:**
```yaml
entities:
  User:
    fields: [id, email, role, created_at]
    relations:
      tasks: {type: one-to-many, target: Task}
  Task:
    fields: [id, title, user_id, status]
    relations:
      user: {type: many-to-one, target: User}
```

**Constitutional Compliance:**
- Simple comparison only (Minimalism)
- Agent-readable YAML format (Agent-centric)
- Verification of implementation (Verification)