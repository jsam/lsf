# Incomplete Implementation Check

Validate that all tasks have complete implementations with proper verification commands.

**Usage:** `/incomplete-check <file>`

**Purpose:** Prevent partial implementations that cause silent failures in production and break CI/CD automation.

**Implementation:**
1. Verify all GREEN tasks have executable verification commands
2. Check for missing error handling, edge cases, configuration
3. Validate implementation completeness against test requirements
4. Ensure all dependencies and integrations are specified
5. Output completeness violation report with missing elements