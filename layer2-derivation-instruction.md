# Layer 2 Derivation Instruction

## Required References
- architecture-boundaries-v3.md (component constraints)
- nfr.yaml (performance/scale requirements)
- Existing codebase patterns in src/

## Input
- human-spec.md (Layer 1)

## Component Selection Process (MANDATORY)
1. Check architecture-boundaries-v3.md Component Index
2. Follow Decision Tree:
   - Django/React built-in? → USE IT
   - Existing pattern in codebase? → COPY IT
   - Can configure existing? → CONFIGURE IT
   - None apply? → Document why new component needed

## Task Sequence

### Step 1: Map User Outcomes to Technical Requirements
For each user outcome in human-spec.md:
1. Identify the technical capability needed
2. Find corresponding component in architecture-boundaries-v3.md
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
Pattern: "User can [ACTION]"
→ Identify: What Django/React component handles this?
→ Output: REQ-XXX: [COMPONENT] handles [ACTION]

Example:
User: "User can login with credentials"
→ REQ-001: Django auth.authenticate() validates credentials
→ REQ-002: Django session stores authentication state
```

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
REQ-001:
- Constraint: [WHAT must be done]
- Component: [EXISTING component from architecture-boundaries-v3.md]
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
- [ ] Every user outcome → at least one requirement
- [ ] Every requirement → references existing component
- [ ] Every requirement → 1-3 tests maximum
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
"User can view list of tasks"

Output (requirements.md):
REQ-001:
- Constraint: Retrieve task list from database
- Component: Django ORM with pagination
- Acceptance: Returns list in <1s

REQ-002:
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

## Success Criteria
- All requirements use existing components from architecture-boundaries-v3.md
- Zero custom implementations without written justification
- Test coverage matches requirement scope (no over-testing)
- Output is machine-parseable without ambiguity