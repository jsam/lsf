# Green Phase Derivation Instruction

## Required References
- .lsf/memory/environment-setup-checklist.md (pre-execution environment)
- red-phase.md (Layer 3A output)
- requirements.md (Layer 2)
- .lsf/memory/architecture-boundaries.md (component constraints)
- Existing codebase patterns in src/

## Input
- red-phase.md with RED-XXX failing test tasks
- requirements.md with REQ-XXX: [OUT-XXX] entries
- architecture-boundaries-v3.md component index

## Task
Generate minimal implementation tasks to make each failing test pass using only existing components.

## Component Selection Process (MANDATORY)
1. For each RED-XXX task, identify the requirement REQ-XXX
2. Check .lsf/memory/architecture-boundaries.md Component Index for existing solution
3. Follow Decision Tree:
   - Django/React built-in? → USE IT
   - Existing pattern in codebase? → COPY IT
   - Can configure existing? → CONFIGURE IT
   - None apply? → REJECT (mark as NEEDS-REVIEW)

## Processing Rules

### Step 0: Environment Verification
1. Verify .lsf/memory/environment-setup-checklist.md requirements are met
2. If environment not ready, output: "BLOCKED: Complete .lsf/memory/environment-setup-checklist.md first"
3. Continue only if environment verified

### Step 1: Test Analysis
1. Extract all RED-XXX tasks from red-phase.md
2. Map each RED-XXX to its source REQ-XXX requirement
3. Identify component type needed from requirement constraint
4. Verify component exists in .lsf/memory/architecture-boundaries.md

### Step 1.5: Secret Dependency Analysis
For each GREEN-XXX task to be generated:
1. Check if implementation requires external services
2. Map external services to required secrets using Service Secret Mapping
3. If secrets needed, output: "REQUIRES-SECRETS: [SECRET_LIST]"
4. If secrets missing, output: "BLOCKED: Add secrets to .lsf/memory/environment-setup-checklist.md"
5. Continue only if all required secrets available

### Step 2: Implementation Mapping
For each RED-XXX:
1. Determine stack (backend/frontend) from test file location
2. Map requirement to existing component from boundaries
3. Generate minimal implementation to pass specific test
4. Include exact file location and verification command

### Component Mapping Rules

**Backend Implementation (Django)**:
- Authentication → Django auth (`django.contrib.auth`)
- API endpoints → Django `@api_view` decorator
- Data models → Django ORM (`models.Model`)
- Background tasks → Celery `@shared_task`
- Validation → Django forms (`forms.Form`)
- Caching → Django cache framework

**Frontend Implementation (React)**:
- UI components → React functional components
- State management → useState/useContext hooks
- Routing → React Router components
- API calls → Axios client
- Forms → React controlled components
- Styling → CSS modules

**Integration Implementation**:
- Database → PostgreSQL via Django ORM
- Queue → Redis via Celery
- API communication → Axios with Django views
- Static files → Nginx serving React build

## Service Secret Mapping

**Authentication Services**:
- Google OAuth → GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- GitHub OAuth → GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- JWT tokens → SECRET_KEY (Django)

**Email Services**:
- SendGrid → SENDGRID_API_KEY, FROM_EMAIL
- Mailgun → MAILGUN_API_KEY, MAILGUN_DOMAIN

**Payment Services**:
- Stripe → STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

**Cloud Storage**:
- AWS S3 → AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME
- Google Cloud → GOOGLE_CLOUD_PROJECT, GOOGLE_APPLICATION_CREDENTIALS

**Monitoring Services**:
- Sentry → SENTRY_DSN
- Google Analytics → GA_TRACKING_ID

**External APIs**:
- Custom API integration → [SERVICE]_API_KEY, [SERVICE]_BASE_URL
- Webhook endpoints → [SERVICE]_WEBHOOK_SECRET

## Output Format

### GREEN Task Structure
```markdown
GREEN-XXX: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: [EXISTING component from .lsf/memory/architecture-boundaries.md]
- File Location: src/[app]/[module].py OR src/frontend/src/[path]
- Implementation: [MINIMAL code pattern to pass test]
- Configuration: [Settings/imports needed]
- Verify Pass: `[EXACT test command from RED-XXX]`
```

### Integration Task Structure
```markdown
GREEN-INT-XXX: Integrate [COMPONENT] with [SYSTEM]
- Purpose: Enable [GREEN-XXX] functionality
- Configuration: [Settings changes, URL patterns, imports]
- Dependencies: [Component connections needed]
- Verify Integration: `tests/run_all_tests_parallelized.py`
```

## Implementation Patterns

### Django Backend Patterns
```python
# API View Pattern
@api_view(['GET', 'POST'])
def endpoint_name(request):
    if request.method == 'POST':
        form = ValidationForm(request.data)
        if form.is_valid():
            return JsonResponse({"id": 1}, status=201)
        return JsonResponse({"error": "Invalid"}, status=400)

# Model Pattern
class ModelName(models.Model):
    field = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)

# Task Pattern
@shared_task
def process_task(data_id):
    return {"status": "completed"}
```

### React Frontend Patterns
```typescript
// Component Pattern
interface Props {
    id: number;
}

export const ComponentName: React.FC<Props> = ({ id }) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        axios.get(`/api/resource/${id}/`).then(r => setData(r.data));
    }, [id]);
    return <div>{data}</div>;
};

// Hook Pattern
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const fetchData = async (url: string) => {
        setLoading(true);
        const response = await axios.get(url);
        setLoading(false);
        return response.data;
    };
    return { fetchData, loading };
};
```

## Task Ordering Rules

1. **Models First**: Django models before views
2. **Backend Before Frontend**: API endpoints before React components
3. **Infrastructure Before Features**: Database setup before business logic
4. **Integration Last**: Component wiring after individual implementations

## Forbidden Patterns

- Custom implementations when existing component works
- Framework additions not in architecture-boundaries-v3.md
- Complex abstractions over simple solutions
- Business logic in views (Django) or components (React)
- Cross-stack implementations (Django in frontend, React in backend)
- Over-engineering beyond test requirements

## Validation Checklist

- [ ] Every RED-XXX → corresponding GREEN-XXX implementation
- [ ] All components reference architecture-boundaries-v3.md
- [ ] No custom frameworks or new dependencies
- [ ] Implementation is minimal to pass test only
- [ ] Stack boundaries respected (Django/React separation)
- [ ] Integration tasks cover component connections
- [ ] All verification commands executable

## Edge Cases

### When Component Doesn't Exist
1. Mark task as "NEEDS-REVIEW"
2. Document which components were considered
3. Explain why existing components don't work
4. Propose minimal extension to existing component

### When Test Requires Multiple Components
1. Create separate GREEN-XXX for each component
2. Add GREEN-INT-XXX for integration
3. Maintain single responsibility per task

### When Implementation Already Exists
1. Mark as GREEN-SKIP-XXX
2. Verify existing implementation passes test
3. Add configuration if needed

## Example Transformation

### Input (red-phase.md):
```
RED-001: Write failing test [TEST-001]
- Traceability: [TEST-001→REQ-001→OUT-001]
- Test Type: Backend Integration
- File Location: tests/integration/test_tasks.py
- Function Name: test_create_task()
- Expected Failure: ImportError (Task model not implemented)
- Verify Failure: `pytest tests/integration/test_tasks.py::test_create_task --tb=short`
```

### Input (requirements.md):
```
REQ-001: [OUT-001]
- Constraint: Create task with title and description
- Component: Django ORM model
- Acceptance: Returns task ID when created
```

### Output (green-phase.md):
```
GREEN-001: Implement [REQ-001] to pass [RED-001]
- Traceability: [RED-001→REQ-001→OUT-001]
- Component: Django ORM (models.Model from architecture-boundaries-v3.md)
- File Location: src/core/models.py
- Implementation: Task model with title/description fields
- Configuration: Add to INSTALLED_APPS, run migrations
- Verify Pass: `pytest tests/integration/test_tasks.py::test_create_task --tb=short`

GREEN-INT-001: Integrate Task model with Django admin
- Purpose: Enable GREEN-001 admin interface
- Configuration: Register model in admin.py
- Dependencies: Task model from GREEN-001
- Verify Integration: `python manage.py check`
```

## Success Criteria

- All RED-XXX tasks have corresponding GREEN-XXX implementations
- All components used exist in architecture-boundaries-v3.md
- No custom frameworks or dependencies added
- Implementation is minimal (only what test requires)
- All tests pass after implementation
- Integration tasks cover component connections
- Output ready for agent execution without interpretation
- Maintains complete traceability to original user outcomes