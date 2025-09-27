# Architecture Boundaries & Decision Space v3

**Purpose**: Agent reference document defining existing architecture boundaries and technology constraints for discriminator/critic agents.

## Component Selection Decision Tree

**MANDATORY DECISION PROCESS:**
1. Does Django/React have this built-in? → **USE IT**
2. Is there an existing pattern in codebase? → **COPY IT**
3. Can existing component be configured? → **CONFIGURE IT**
4. Only if 1-3 are NO → Consider new component (requires written justification)

## Existing Components Index

### Backend Components (MUST USE)
- **Authentication**: Django built-in auth (`django.contrib.auth`)
- **API Views**: Django views with `@api_view` decorator
- **Forms/Validation**: Django forms (`django.forms`)
- **ORM**: Django ORM (`django.db.models`)
- **Admin**: Django admin (`django.contrib.admin`)
- **Caching**: Django cache framework with Redis backend
- **Background Tasks**: Celery with `@shared_task` decorator
- **Pagination**: Django Paginator (`django.core.paginator`)
- **Serialization**: Django `JsonResponse`
- **Sessions**: Django sessions (`django.contrib.sessions`)
- **Static Files**: Django static (`django.contrib.staticfiles`)
- **Testing**: pytest with Django fixtures

### Frontend Components (MUST USE)
- **State Management**: React useState/useContext (no Redux)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Testing**: Vitest with Testing Library
- **Build**: Vite
- **Type Checking**: TypeScript

### Frontend Layout Components (Architecture Boundaries)
**Location**: `src/frontend/src/components/`

#### Layout Components
- **AdminLayout**: `layout/AdminLayout.tsx` - Left sidebar + main content structure
- **Sidebar**: `layout/Sidebar.tsx` - Collapsible navigation with icons
- **Header**: `layout/Header.tsx` - Top bar with breadcrumbs and user actions
- **MainContent**: `layout/MainContent.tsx` - Responsive content area

#### UI Foundation Components
- **Card**: `ui/Card.tsx` - Standard content container with optional title/actions
- **Button**: `ui/Button.tsx` - Consistent button styling (primary/secondary/outline)
- **Modal**: `ui/Modal.tsx` - Overlay system for forms/dialogs with focus management
- **LoadingSpinner**: `ui/LoadingSpinner.tsx` - Standard loading state indicator
- **Form**: `ui/Form.tsx` - Standardized form layout with loading states
- **Input**: `ui/Input.tsx` - Text input with error states and validation
- **Select**: `ui/Select.tsx` - Dropdown select with search and multi-select

#### Navigation Components
- **NavItem**: `navigation/NavItem.tsx` - Sidebar navigation item with icon
- **Breadcrumbs**: `navigation/Breadcrumbs.tsx` - Path navigation component
- **UserMenu**: `navigation/UserMenu.tsx` - Profile dropdown menu

#### React Hooks (Utilities)
- **useAuth**: `hooks/useAuth.ts` - User authentication state management
- **useNavigation**: `hooks/useNavigation.ts` - Navigation state and breadcrumbs
- **useModal**: `hooks/useModal.ts` - Modal state management
- **useBreadcrumbs**: `hooks/useBreadcrumbs.ts` - Dynamic breadcrumb management

## Technology Stack Boundaries

### Backend (Django/Python)
**Location**: `src/`
**Stack**: Django 4.2+ / Python 3.x / PostgreSQL / Celery / Redis
**Dependencies**: `src/requirements.txt` (core packages)
**Architecture**: Django MVT pattern with Celery async tasks
**Data Models**: Django ORM models in `src/core/models/`
**Deployment**: Docker containers via docker-compose

### Frontend (React/TypeScript)
**Location**: `src/frontend/`
**Stack**: React 18 / TypeScript 5 / Vite / Vitest
**Dependencies**: `package.json` (minimal - React, Router, Axios, Testing)
**Architecture**: Component-based SPA with API client
**Deployment**: Nginx static serving in Docker

### Infrastructure
**Orchestration**: Docker Compose (5 services)
**Database**: PostgreSQL 15-alpine
**Cache/Queue**: Redis 7-alpine
**Web Server**: Nginx (frontend proxy)
**App Server**: Gunicorn (Django WSGI)

### Testing Infrastructure
**Structure**:
```
tests/
├── integration/*_workflows.py    # Feature workflows
├── unit/test_*.py                # Complex algorithms only
└── e2e/smoke.py                  # System operational tests
```
**Test Naming**: `test_feature_scenario()` for functions
**Test IDs**: `TEST-001` format for traceability
**Verification**: `pytest tests/unit/ -v` / `tests/run_all_tests_parallelized.py`

## Architecture Constraints

### MUST Use (Non-Negotiable)
- Python backend with Django framework
- React+TypeScript frontend
- PostgreSQL database / Redis queue
- Docker Compose orchestration
- Django built-in components (see Existing Components Index)
- Agentic TDD test hierarchy

### MUST NOT Use (Forbidden)
- Non-Python backend / Non-React frontend
- Alternative databases / Alternative queues
- Non-Docker deployment
- Django REST Framework or similar
- Redux or other state management libraries
- Custom implementations of existing Django/React features
- Threading/multiprocessing/asyncio
- Raw SQL queries
- Class-based views
- Flat test structure

### MAY Extend (Requires Written Justification)
- **Python packages**: ONLY if no Django/stdlib equivalent exists
  - Must document: Why existing component doesn't work
  - Must prove: Size <10MB, no CVEs, maintained <12 months
  - Must show: No configuration of existing solves it
- **React packages**: ONLY if no React/browser API exists
  - Must document: Bundle impact <50KB gzipped
  - Must prove: No vanilla JS/React solution exists
  - Must show: Performance benefit justifies inclusion
- **Django apps**: Only for new bounded contexts in `src/`
- **React components**: Only in `src/frontend/src/components/`

## Anti-Patterns (FORBIDDEN)

### Backend Anti-Patterns
- Custom ORM when Django ORM works
- Custom validation when Django validators exist
- Custom auth when Django auth suffices
- New framework for solved problems
- Abstraction layers over Django
- Utility libraries for Django built-ins
- Custom admin interfaces
- Manual transaction management
- Custom middleware without justification

### Frontend Anti-Patterns
- Custom state management over useState/useContext
- jQuery or direct DOM manipulation
- CSS-in-JS libraries (use CSS modules)
- Custom routing over React Router
- Custom HTTP clients over Axios
- Abstraction layers over React
- Higher-order components (use hooks)
- Class components (use functional)

## Service Boundaries

### Web Service (Django)
**Port**: 8000
**Health Check**: `curl -f http://localhost:8000/api/health/`
**Startup Dependencies**: db → redis → web
**Timeout**: 30s startup

### Celery Service
**Health Check**: `celery -A django_celery_base inspect ping`
**Startup Dependencies**: web → celery
**Graceful Degradation**: Queue tasks if worker down

### Frontend Service
**Port**: 80
**Health Check**: `curl -f http://localhost:80/`
**API Proxy**: `/api/*` → `web:8000`

### Database Service
**Port**: 5432 (internal)
**Health Check**: `pg_isready -U django_user -d django_db`
**Startup Time**: 10s

### Redis Service
**Port**: 6379 (internal)
**Health Check**: `redis-cli ping`
**Startup Time**: 2s

## API Contract Boundaries

### Endpoint Patterns
```
GET    /api/{resource}/           # List
POST   /api/{resource}/           # Create
GET    /api/{resource}/{id}/      # Retrieve
PUT    /api/{resource}/{id}/      # Update
DELETE /api/{resource}/{id}/      # Delete
```

### Request Format
```json
{
  "field": "value",
  "nested": {"key": "value"}
}
```

### Response Format (Success)
```json
{
  "id": 1,
  "field": "value",
  "created": "2024-01-01T00:00:00Z"
}
```

### Response Format (Error)
```json
{
  "error": "Validation failed",
  "details": {"field": ["Required field"]}
}
```
**Status Codes**: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error

## Data Model Boundaries

### Relationship Rules
- **CASCADE**: Parent deletion → cascade dependent records
- **PROTECT**: Prevent deletion if dependencies exist
- **SET_NULL**: Optional relationships → null on deletion
- **Many-to-Many**: Through explicit junction models only

### Migration Rules
- Forward-only migrations
- No data migrations in schema migrations
- Rollback via new forward migration

### Validation
- Model-level via Django validators
- API-level via Django forms
- Database-level via constraints

## Performance Boundaries

### Response Times
- CRUD operations: <1s (verify: `time curl -s http://localhost:8000/api/{endpoint}/`)
- Complex queries: <5s (verify: `pytest --benchmark`)
- Test suite: <2min (verify: `time tests/run_all_tests_parallelized.py`)

### Resource Limits
- Container memory: <500MB each (verify: `docker stats --no-stream`)
- Database connections: <20 concurrent
- Redis memory: <100MB

## Security Boundaries

### Authentication
- Django session auth (development)
- CORS: localhost only
- Admin: Django admin interface

### Data Protection
- PostgreSQL constraints only
- Development secrets in environment
- No external auth providers

## Implementation Mandates

### Mandatory Reuse Patterns

**Authentication**:
```python
from django.contrib.auth.decorators import login_required

@login_required
@api_view(['GET'])
def protected_endpoint(request):
    return JsonResponse({"user": request.user.username})
```

**Pagination**:
```python
from django.core.paginator import Paginator

def list_items(request):
    paginator = Paginator(Model.objects.all(), 25)
    page = paginator.get_page(request.GET.get('page'))
    return JsonResponse({"results": list(page.object_list.values())})
```

**Validation**:
```python
from django import forms

class ItemForm(forms.Form):
    name = forms.CharField(max_length=100)

    def clean_name(self):
        # MUST use Django validators
        return self.cleaned_data['name']
```

**Caching**:
```python
from django.core.cache import cache

def expensive_operation():
    result = cache.get('key')
    if result is None:
        result = compute_expensive()
        cache.set('key', result, 3600)  # Max 1hr TTL
    return result
```

### Django Development

**ORM Usage**:
- MUST use Django ORM for all database operations (no raw SQL)
- MUST use `Model.objects.create()` over `.save()` for new records
- MUST use `select_related()` and `prefetch_related()` for JOINs
- MUST use `F()` and `Q()` objects for complex queries
- MUST use `.only()` and `.defer()` for field optimization

**Management Commands**:
- MUST use `python manage.py startapp` for new apps
- MUST use `python manage.py makemigrations` for schema changes
- MUST use Django admin for backoffice (no custom admin panels)

**App Structure**:
```
app/
├── models.py       # MUST: Single file, <500 lines
├── views.py        # MUST: API views only
├── tasks.py        # MUST: Celery tasks only
├── forms.py        # MUST: Validation only
└── urls.py         # MUST: URL patterns only
```

### Async Task Patterns

**Celery-Only**:
```python
# MUST: All async in Celery
@shared_task(bind=True, max_retries=3)
def process_data(self, data_id):
    try:
        result = {"status": "completed"}
        return result  # JSON-serializable only
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2**self.request.retries)

# MUST NOT: Threading/async
async def forbidden():  # FORBIDDEN
    pass
```

### API Development

**Django Views**:
- MUST use `@api_view` decorator (no class-based views)
- MUST validate via Django forms
- MUST return consistent JSON structure
- MUST NOT add Django REST Framework

**Response Pattern**:
```python
@api_view(['POST'])
def endpoint(request):
    form = ValidationForm(request.data)
    if form.is_valid():
        return JsonResponse({"id": 1}, status=201)
    return JsonResponse({"error": "Invalid", "details": form.errors}, status=400)
```

### Frontend Patterns

**React Components**:
- MUST use functional components with hooks
- MUST use TypeScript interfaces for props
- MUST keep components <200 lines
- MUST use Axios for API calls
- MUST use existing components before creating new

**Component Pattern**:
```typescript
interface Props {
    id: number;
}

export const Component: React.FC<Props> = ({ id }) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        axios.get(`/api/resource/${id}/`).then(r => setData(r.data));
    }, [id]);
    return <div>{data}</div>;
};
```

### Testing Patterns
- MUST use pytest fixtures over setUp/tearDown
- MUST mock at service boundaries only
- MUST use factories for test data
- MUST clean up after each test
- MUST reuse existing test utilities

### Performance Patterns

**Query Optimization**:
- MUST paginate lists >100 items
- MUST add indexes for foreign keys
- MUST use `bulk_create()` for batch inserts
- MUST cache expensive queries in Redis (max 1hr TTL)
- MUST use Django's built-in query optimization

## Extension Guidelines

### Safe Extensions
```python
# New model in src/core/models/
class NewModel(models.Model):
    field = models.CharField(max_length=100)

# New API in existing app
@api_view(['GET'])
def new_endpoint(request):
    return JsonResponse({"status": "ok"})

# New React component
export const NewComponent: React.FC = () => {
    return <div>Component</div>
}
```

### Package Addition Criteria
1. **Prove no existing solution**: Document Django/React equivalent search
2. **Size**: <10MB for Python, <50KB for JS
3. **Security**: No known CVEs
4. **Maintenance**: Updated within 12 months
5. **Version**: Pinned in requirements.txt/package.json
6. **Justification**: Written explanation why needed

### Forbidden Extensions
- Cross-service database access
- Direct Redis manipulation outside Celery
- Custom authentication systems
- Breaking API versioning
- Non-JSON API formats
- Alternative web frameworks
- Threading/multiprocessing/asyncio
- Raw SQL queries
- Abstraction layers over framework
- Utility libraries for built-ins

## Verification Commands

### Service Health
```bash
docker compose ps                           # All services running
curl -f http://localhost:8000/api/health/   # Django API
curl -f http://localhost:80/                # Frontend
```

### Performance
```bash
time curl http://localhost:8000/api/tasks/  # API response time
docker stats --no-stream                    # Resource usage
pytest --benchmark                          # Code benchmarks
```

### Testing
```bash
pytest tests/unit/ -v                       # Unit tests
python tests/run_all_tests_parallelized.py  # Full suite
```

## Frontend Component Usage Examples for Agents

### Using AdminLayout
```typescript
// All admin pages MUST use AdminLayout from architecture boundaries
import AdminLayout from '../components/layout/AdminLayout'

function NewPage() {
  return (
    <AdminLayout>
      {/* Page content here */}
    </AdminLayout>
  )
}
```

### Using Card Component
```typescript
// Use Card for content grouping
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

<Card
  title="Section Title"
  actions={<Button variant="primary">Action</Button>}
>
  {/* Card content */}
</Card>
```

### Using Modal System
```typescript
// Use Modal with useModal hook
import Modal from '../components/ui/Modal'
import { useModal } from '../hooks/useModal'

function Component() {
  const modal = useModal()

  return (
    <>
      <Button onClick={modal.open}>Open Modal</Button>
      <Modal open={modal.isOpen} onClose={modal.close}>
        {/* Modal content */}
      </Modal>
    </>
  )
}
```

### Using Form Components
```typescript
// Use Form, Input, Select from architecture boundaries
import Form from '../components/ui/Form'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

<Form onSubmit={handleSubmit} loading={isLoading}>
  <Input label="Name" error={errors.name} />
  <Select label="Type" options={options} />
</Form>
```

## Enforcement

This document bounds the decision space for all discriminator/critic agents. Violations of MUST/MUST NOT rules should result in immediate rejection. MAY extensions require explicit justification referencing this document's criteria.