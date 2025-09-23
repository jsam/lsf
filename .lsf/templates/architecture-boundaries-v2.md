# Architecture Boundaries & Decision Space v2

**Purpose**: Agent reference document defining existing architecture boundaries and technology constraints for discriminator/critic agents.

## Technology Stack Boundaries

### Backend (Django/Python)
**Location**: `src/`
**Stack**: Django 4.2+ / Python 3.x / PostgreSQL / Celery / Redis
**Dependencies**: `src/requirements.txt` (10 core packages)
**Architecture**: Django MVT pattern with Celery async tasks
**Data Models**: 12 domain models (Employee, Ticket, TimeBooking, etc.)
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
- Python backend / React+TypeScript frontend
- PostgreSQL database / Redis queue
- Docker Compose orchestration
- Agentic TDD test hierarchy

### MUST NOT Use (Forbidden)
- Non-Python backend / Non-React frontend
- Alternative databases / Alternative queues
- Non-Docker deployment
- Flat test structure

### MAY Extend (Agent Decision Space)
- Python packages (<10MB per package, security vetted, pinned versions)
- React packages (bundle impact <50KB gzipped)
- Django apps in `src/`
- React components in `src/frontend/src/`

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
GET    /api/tasks/           # List
POST   /api/tasks/           # Create
GET    /api/tasks/{id}/      # Retrieve
PUT    /api/tasks/{id}/      # Update
DELETE /api/tasks/{id}/      # Delete
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
- **CASCADE**: Employee deletion → cascade TimeBookings
- **PROTECT**: BillingProject deletion → protect if TimeBookings exist
- **SET_NULL**: Optional relationships (Team → null)
- **Many-to-Many**: Through explicit junction models only

### Migration Rules
- Forward-only migrations
- No data migrations in schema migrations
- Rollback via new forward migration

### Validation
- Model-level via Django validators
- API-level via serializers
- Database-level via constraints

## Performance Boundaries

### Response Times
- CRUD operations: <1s (verify: `time curl -s http://localhost:8000/api/tasks/`)
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
- MUST validate via Django forms or serializers
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

### Performance Patterns
**Query Optimization**:
- MUST paginate lists >100 items
- MUST add indexes for foreign keys
- MUST use `bulk_create()` for batch inserts
- MUST cache expensive queries in Redis (max 1hr TTL)

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
1. Size: <10MB for Python, <50KB for JS
2. Security: No known CVEs
3. Maintenance: Updated within 12 months
4. Version: Pinned in requirements.txt/package.json

### Forbidden Extensions
- Cross-service database access
- Direct Redis manipulation outside Celery
- Custom authentication systems
- Breaking API versioning
- Non-JSON API formats
- Django REST Framework or similar
- Threading/multiprocessing
- Raw SQL queries

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

This document bounds the decision space for all discriminator/critic agents operating on this codebase.