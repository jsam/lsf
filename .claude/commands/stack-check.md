# Stack Contamination Check

Enforce clean Django backend / React frontend boundaries to prevent deployment and security issues.

**Usage:** `/stack-check <file>`

**Purpose:** Prevent cross-stack contamination that breaks deployment automation and creates security vulnerabilities.

**Implementation:**
1. Scan for Django concepts in frontend contexts
2. Scan for React concepts in backend contexts
3. Validate test framework boundaries (pytest vs Vitest)
4. Check for inappropriate server-side rendering or client-side business logic
5. Output structured boundary violation report