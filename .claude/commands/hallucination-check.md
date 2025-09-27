# Hallucination Check

Validate that all referenced components, APIs, and modules exist in the codebase or architecture boundaries.

**Usage:** `/hallucination-check <file>`

**Purpose:** Prevent LLM hallucination of non-existent functionality that breaks automated build/test cycles.

**Implementation:**
1. Extract all component references, imports, and API calls from file
2. Cross-reference against `.lsf/memory/architecture-boundaries.md`
3. Validate imports against actual codebase structure
4. Output structured violation report for agent consumption
5. Return PASS/BLOCKED status with specific evidence