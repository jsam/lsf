# Test-Code Coupling Check

Validate that tests fail for correct reasons and implementations test real functionality.

**Usage:** `/coupling-check <file>`

**Purpose:** Prevent trivial test passes and mock satisfaction that creates false confidence in implementation quality.

**Implementation:**
1. Verify RED tests fail due to missing implementation, not syntax errors
2. Check that GREEN implementations test actual behavior, not just structure
3. Validate test assertions against real functionality requirements
4. Ensure tests verify business logic, not just interface compliance
5. Output coupling violation report with test quality issues