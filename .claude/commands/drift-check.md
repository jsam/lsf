# Context Drift Check

Validate that all tasks maintain connection to original user outcomes and requirements.

**Usage:** `/drift-check <file>`

**Purpose:** Prevent implementation drift from user outcomes that breaks traceability and mission focus.

**Implementation:**
1. Validate OUT-XXX → REQ-XXX → TEST-XXX → GREEN-XXX traceability chains
2. Check for scope creep indicators ("while we're at it", "also implement")
3. Ensure tasks serve original user outcomes
4. Flag disconnected or orphaned requirements
5. Output drift violation report with traceability gaps