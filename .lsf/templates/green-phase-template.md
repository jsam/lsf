# Green Phase: Implementation to Pass Tests

## Backend Implementation Tasks

GREEN-001: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: Django ORM (models.Model from .lsf/memory/architecture-boundaries.md)
- File Location: src/core/models.py
- Implementation: [MODEL_NAME] with required fields
- Configuration: Add to INSTALLED_APPS, run migrations
- Verify Pass: `pytest tests/integration/test_[feature].py::test_[scenario] --tb=short`

GREEN-002: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: Django API view (@api_view from .lsf/memory/architecture-boundaries.md)
- File Location: src/[app]/views.py
- Implementation: [ENDPOINT_NAME] function with validation
- Configuration: Add URL pattern to urls.py
- Verify Pass: `pytest tests/contract/test_[api].py::test_[endpoint] --tb=short`

GREEN-003: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: Celery task (@shared_task from .lsf/memory/architecture-boundaries.md)
- File Location: src/[app]/tasks.py
- Implementation: [TASK_NAME] function with error handling
- Configuration: Import in celery.py autodiscover
- Verify Pass: `pytest tests/integration/test_[feature].py::test_[async_scenario] --tb=short`

GREEN-004: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: Django forms (forms.Form from .lsf/memory/architecture-boundaries.md)
- File Location: src/[app]/forms.py
- Implementation: [FORM_NAME] class with validators
- Configuration: Import in views.py
- Verify Pass: `pytest tests/unit/test_[module].py::test_[validation] --tb=short`

## Frontend Implementation Tasks

GREEN-101: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: React functional component (from .lsf/memory/architecture-boundaries.md)
- File Location: src/frontend/src/components/[ComponentName].tsx
- Implementation: [COMPONENT_NAME] with props interface
- Configuration: Export from index.ts
- Verify Pass: `npm test -- [ComponentName].test.tsx`

GREEN-102: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: React hooks (useState/useEffect from .lsf/memory/architecture-boundaries.md)
- File Location: src/frontend/src/hooks/[hookName].ts
- Implementation: [HOOK_NAME] with state management
- Configuration: Export from hooks/index.ts
- Verify Pass: `npm test -- [hookName].test.ts`

GREEN-103: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: Axios API client (from .lsf/memory/architecture-boundaries.md)
- File Location: src/frontend/src/services/[serviceName].ts
- Implementation: [SERVICE_NAME] with API methods
- Configuration: Import axios, configure base URL
- Verify Pass: `npm test -- [serviceName].test.ts`

GREEN-104: Implement [REQ-XXX] to pass [RED-XXX]
- Traceability: [RED-XXX→REQ-XXX→OUT-XXX]
- Component: React Router (from .lsf/memory/architecture-boundaries.md)
- File Location: src/frontend/src/routes/[RouteName].tsx
- Implementation: [ROUTE_COMPONENT] with navigation
- Configuration: Add to router configuration
- Verify Pass: `npm test -- [RouteName].test.tsx`

## Integration Tasks

GREEN-INT-001: Integrate [COMPONENT] with Django admin
- Purpose: Enable [GREEN-XXX] admin interface
- Configuration: Register model in admin.py
- Dependencies: Model from GREEN-XXX
- Verify Integration: `python manage.py check`

GREEN-INT-002: Integrate API endpoints with frontend
- Purpose: Connect [GREEN-XXX] backend with [GREEN-YYY] frontend
- Configuration: CORS settings, API base URL
- Dependencies: Backend API + Frontend service
- Verify Integration: `tests/run_all_tests_parallelized.py`

GREEN-INT-003: Integrate Celery tasks with views
- Purpose: Enable [GREEN-XXX] async processing
- Configuration: Task import, delay() calls
- Dependencies: Task function + API view
- Verify Integration: `python manage.py check && celery -A django_celery_base inspect ping`

GREEN-INT-004: Integrate React components with routing
- Purpose: Enable [GREEN-XXX] navigation
- Configuration: Route definitions, component imports
- Dependencies: Component + Router setup
- Verify Integration: `npm run build`

## Configuration Tasks

GREEN-CONFIG-001: Configure database migrations
- Purpose: Apply [GREEN-XXX] model changes
- Commands: `python manage.py makemigrations && python manage.py migrate`
- Dependencies: Model implementations
- Verify: `python manage.py showmigrations`

GREEN-CONFIG-002: Configure static file serving
- Purpose: Enable [GREEN-XXX] asset delivery
- Configuration: STATIC_URL, collectstatic
- Dependencies: Frontend build output
- Verify: `python manage.py collectstatic --dry-run`

GREEN-CONFIG-003: Configure development environment
- Purpose: Enable [GREEN-XXX] development workflow
- Configuration: Environment variables, debug settings
- Dependencies: All implementations
- Verify: `docker compose up --build`

## Edge Case Tasks

GREEN-SKIP-001: Verify existing implementation for [REQ-XXX]
- Reason: Implementation already exists
- Component: [EXISTING_COMPONENT]
- Verification: Test passes without changes
- Verify: `[TEST_COMMAND from RED-XXX]`

GREEN-REVIEW-001: Review requirement [REQ-XXX] for implementation
- Reason: No existing component matches requirement
- Analysis: Evaluated [COMPONENT_LIST] from .lsf/memory/architecture-boundaries.md
- Recommendation: [MINIMAL_EXTENSION] to existing component
- Status: NEEDS-REVIEW

## Validation Tasks

GREEN-VALIDATE-001: Verify all tests pass
- Command: `tests/run_all_tests_parallelized.py`
- Expected: All RED-XXX tests now pass
- Success: Green phase complete

GREEN-VALIDATE-002: Verify no regressions
- Command: `pytest tests/ && npm test`
- Expected: All existing tests still pass
- Success: Implementation doesn't break existing functionality

GREEN-VALIDATE-003: Verify component boundaries respected
- Check: All implementations use components from .lsf/memory/architecture-boundaries.md
- Expected: No custom frameworks or dependencies
- Success: Clean architecture compliance

---
<!--
Layer: 3B
Type: green-phase
Input: red-phase.md, requirements.md
Dependencies: .lsf/memory/architecture-boundaries.md
-->