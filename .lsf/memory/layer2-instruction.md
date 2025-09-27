# Layer 2 Derivation Instruction

## Required References
- .lsf/memory/architecture-boundaries.md (component constraints)
- nfr.yaml (performance/scale requirements)
- Existing codebase patterns in src/

## Input
- human-spec.md (Layer 1)

## Component Selection Process (MANDATORY)
1. Check .lsf/memory/architecture-boundaries.md Component Index
2. Follow Decision Tree:
   - Django/React built-in? → USE IT
   - Existing pattern in codebase? → COPY IT
   - Can configure existing? → CONFIGURE IT
   - None apply? → Document why new component needed

## Task Sequence

### Step 1: Map User Outcomes to Technical Requirements
For each user outcome in human-spec.md:
1. Identify the technical capability needed
2. Find corresponding component in .lsf/memory/architecture-boundaries.md
3. Create requirement with existing component reference
4. Assign REQ-XXX ID

### Step 2: Generate Test Specifications
For each requirement:
1. Determine test type needed:
   - API endpoint → Integration test
   - External system → Contract test
   - Performance constraint → Load test
   - Algorithm → Unit test (rare)
2. Create 1-3 tests maximum per requirement
3. Link TEST-XXX to REQ-XXX

## Transformation Rules

### User Outcome → Requirement Mapping
```
Pattern: "[OUT-XXX] User can [ACTION]"
→ Identify: What Django/React component handles this?
→ Output: REQ-YYY: [OUT-XXX] - [COMPONENT] handles [ACTION]

Example:
[OUT-001] User can login with credentials
→ REQ-001: [OUT-001] - Django auth.authenticate() validates credentials
→ REQ-002: [OUT-001] - Django session stores authentication state
```

### Outcome ID Preservation Rules
- Every [OUT-XXX] from human-spec.md MUST generate at least one REQ
- Each REQ must reference exactly one [OUT-XXX]
- One outcome may generate multiple requirements
- Format: `REQ-XXX: [OUT-YYY]` where YYY is source outcome ID

### Requirement → Test Mapping
```
Pattern: REQ-XXX uses [COMPONENT]
→ TEST-XXX: Verify [COMPONENT] behavior

Example:
REQ-001: Django auth.authenticate() validates credentials
→ TEST-001: POST /api/login with valid → 200 + session
→ TEST-002: POST /api/login with invalid → 401
```

## Component Assignment Rules

### Backend Requirements
- Authentication → Django auth (`django.contrib.auth`)
- API endpoints → Django `@api_view` decorator
- Data persistence → Django ORM models
- Background tasks → Celery `@shared_task`
- Caching → Django cache with Redis
- Validation → Django forms

### Frontend Requirements
- UI components → React functional components
- State → useState/useContext (NOT Redux)
- Routing → React Router
- API calls → Axios
- Styling → CSS modules (NOT CSS-in-JS)

### Infrastructure Requirements
- Service communication → Docker network
- Data storage → PostgreSQL
- Queue → Redis via Celery
- Static files → Nginx

## Output Format Requirements

### requirements.md Structure
```markdown
REQ-001: [OUT-XXX]
- Constraint: [WHAT must be done]
- Component: [EXISTING component from .lsf/memory/architecture-boundaries.md]
- Acceptance: [MEASURABLE criteria]
```

### test-cases.md Structure
```markdown
TEST-001: [REQ-001]
- Type: [Integration|Contract|Load|Unit]
- Input: [EXACT data/action]
- Expected: [EXACT output/behavior]
- Verify: `pytest tests/[path]`
```

## Validation Checklist
- [ ] Every [OUT-XXX] from human-spec.md → at least one requirement
- [ ] Every requirement → references exactly one [OUT-XXX]
- [ ] Every requirement → references existing component
- [ ] Every requirement → 1-3 tests maximum
- [ ] No orphaned outcomes (all [OUT-XXX] referenced)
- [ ] No custom implementations without justification
- [ ] No business language in outputs
- [ ] All IDs are unique and sequential

## Forbidden Patterns
- Creating new auth system (use Django auth)
- Custom state management (use React hooks)
- New frameworks/libraries without justification
- Business terminology in requirements
- Implementation details in requirements
- More than 3 tests per requirement
- Unit tests for CRUD operations

## Edge Cases

### When No Existing Component Fits
1. Document which components were considered
2. Explain why each doesn't work
3. Propose minimal extension to existing component
4. Mark requirement as "NEEDS-REVIEW"

### When User Outcome is Vague
1. Decompose into concrete actions
2. Map each action to technical capability
3. If still unclear, mark as "AMBIGUOUS"

## Examples

### Complete Transformation
```
Input (human-spec.md):
[OUT-001] User can view list of tasks

Output (requirements.md):
REQ-001: [OUT-001]
- Constraint: Retrieve task list from database
- Component: Django ORM with pagination
- Acceptance: Returns list in <1s

REQ-002: [OUT-001]
- Constraint: Display task list in UI
- Component: React component with Axios
- Acceptance: Renders without errors

Output (test-cases.md):
TEST-001: [REQ-001]
- Type: Integration
- Input: GET /api/tasks/
- Expected: 200 with JSON array
- Verify: `pytest tests/integration/test_tasks.py::test_list`

TEST-002: [REQ-002]
- Type: Integration
- Input: Navigate to /tasks
- Expected: Task list renders
- Verify: `npm test -- TaskList.test.tsx`
```

## Traceability Validation
Run these checks before finalizing:
```bash
# Extract all outcome IDs from human spec
grep -o '\[OUT-[0-9]\+\]' human-spec.md | sort -u > outcomes.txt

# Extract all outcome references from requirements
grep -o '\[OUT-[0-9]\+\]' requirements.md | sort -u > referenced.txt

# Verify all outcomes are covered
diff outcomes.txt referenced.txt  # Should be empty

# Verify no requirement lacks outcome reference
grep '^REQ-' requirements.md | grep -v '\[OUT-' # Should return nothing
```

## Success Criteria
- All [OUT-XXX] from human-spec.md traced to requirements
- All requirements reference their source [OUT-XXX]
- All requirements use existing components from .lsf/memory/architecture-boundaries.md
- Zero custom implementations without written justification
- Test coverage matches requirement scope (no over-testing)
- Output is machine-parseable without ambiguity
- Complete traceability: Outcome → Requirement → Test