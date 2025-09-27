# Over-Engineering Check

Validate that implementations follow minimalism principle and avoid unnecessary complexity.

**Usage:** `/overeng-check <file>`

**Purpose:** Prevent complex solutions that reduce maintainability, increase technical debt, and slow iteration.

**Implementation:**
1. Count abstractions, patterns, and flag excess complexity
2. Check for "impressive" solutions when simple ones would work
3. Validate minimal implementation requirement (only what tests require)
4. Flag complex patterns (abstract factory, microservices) unless justified
5. Output over-engineering violation report with simplification suggestions