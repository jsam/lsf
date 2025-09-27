# Dependency Explosion Check

Validate that implementations use existing dependencies rather than adding new ones.

**Usage:** `/dependency-check <file>`

**Purpose:** Prevent dependency bloat that increases maintenance burden and breaks automated updates.

**Implementation:**
1. Check for new library suggestions not in existing package.json/requirements.txt
2. Validate Django/React built-in usage before external libraries
3. Cross-reference against architecture-boundaries.md component catalog
4. Flag custom implementations when existing components could work
5. Output dependency violation report with alternatives