# Pattern Consistency Check

Validate that implementations follow established codebase patterns and conventions.

**Usage:** `/pattern-check <file>`

**Purpose:** Maintain code consistency to prevent maintainability issues and confusion in future LLM iterations.

**Implementation:**
1. Compare implementation patterns against existing codebase conventions
2. Check for architectural style mixing (REST + GraphQL, Class + Functional)
3. Validate naming conventions and code structure consistency
4. Ensure new code follows established patterns from existing modules
5. Output pattern violation report with consistency issues