# Architecture Boundaries & Decision Space

**Purpose**: Agent reference document defining existing architecture boundaries and technology constraints for discriminator/critic agents.

## Technology Stack Boundaries

### Backend (Django/Python)
**Location**: `src/`
**Stack**: Django 4.2+ / Python 3.x / PostgreSQL / Celery / Redis
**Dependencies**: `src/requirements.txt` (10 core packages)
**Architecture**: Django MVT pattern with Celery async tasks
**Data Models**: 12 domain models (Employee, Ticket, TimeBooking, etc.)
**API**: Django REST views with JSON responses
**Deployment**: Docker containers via docker-compose

### Frontend (React/TypeScript)
**Location**: `src/frontend/`
**Stack**: React 18 / TypeScript 5 / Vite / Vitest
**Dependencies**: `package.json` (minimal - React, Router, Axios, Testing)
**Architecture**: Component-based SPA with API client
**Testing**: Vitest + Testing Library
**Deployment**: Nginx static serving in Docker

### Infrastructure
**Orchestration**: Docker Compose (5 services)
**Database**: PostgreSQL 15-alpine
**Cache/Queue**: Redis 7-alpine
**Web Server**: Nginx (frontend proxy)
**App Server**: Gunicorn (Django WSGI)

### Testing Infrastructure
**Structure**: Agentic TDD hierarchy (`tests/integration/`, `tests/unit/`, `tests/e2e/`)
**Runners**: Sequential (`run_all_tests.sh`) + Parallel (`run_all_tests_parallelized.py`)
**Frameworks**: pytest (Python), Vitest (React)
**Coverage**: Integration-first, minimal unit tests

## Architecture Constraints

### MUST Use (Non-Negotiable)
- **Backend Language**: Python only
- **Frontend Framework**: React + TypeScript only
- **Database**: PostgreSQL only
- **Message Queue**: Redis/Celery only
- **Containerization**: Docker Compose only
- **Test Structure**: Agentic TDD hierarchy only

### MUST NOT Use (Forbidden)
- Multiple backend languages/frameworks
- Database changes (no MongoDB, MySQL, etc.)
- Alternative frontend frameworks (Vue, Angular, etc.)
- Non-Docker deployment patterns
- Traditional test organization (no `/tests/unit/test_*.py` flat structure)

### MAY Extend (Agent Decision Space)
- Additional Python packages in `requirements.txt`
- Additional React packages in `package.json`
- New Django apps within `src/`
- New React components within `src/frontend/src/`
- New test files following agentic hierarchy

## Service Boundaries

### Web Service (Django)
**Ports**: 8000
**Dependencies**: db, redis
**Responsibilities**: HTTP API, model management, business logic
**Environment**: Django settings via env vars

### Celery Service
**Dependencies**: web, redis, db
**Responsibilities**: Async task processing
**Environment**: Shared with web service

### Frontend Service
**Ports**: 80
**Dependencies**: web (API proxy)
**Responsibilities**: React SPA serving, API routing
**Configuration**: Nginx config in `src/nginx.conf`

### Database Service
**Ports**: 5432 (internal)
**Responsibilities**: PostgreSQL data persistence
**Volumes**: `postgres_data`

### Redis Service
**Ports**: 6379 (internal)
**Responsibilities**: Celery broker/backend, caching
**Volumes**: `redis_data`

## Development Boundaries

### File Structure Constraints
```
src/
├── core/                    # Django models only
├── tasks/                   # Django tasks app only
├── django_celery_base/      # Django settings only
├── frontend/                # React app only
├── requirements.txt         # Python deps only
├── docker-compose.yml       # Infrastructure only
└── Dockerfile              # Django container only

tests/
├── integration/             # Feature workflows only
├── unit/                    # Complex algorithms only
└── e2e/                     # System smoke tests only
```

### API Contract Boundaries
**Format**: JSON only
**Authentication**: Django session/token
**Endpoints**: RESTful `/api/*` pattern
**Error Handling**: HTTP status codes + JSON error objects
**CORS**: Configured for frontend domain

### Data Model Boundaries
**ORM**: Django models only
**Relationships**: Foreign keys within PostgreSQL
**Migrations**: Django migration system only
**Validation**: Django model validation + serializers

## Performance Boundaries

### Response Time Constraints
- API endpoints: <1s for CRUD operations
- Complex queries: <5s maximum
- Frontend bundle: <500KB gzipped
- Test execution: <2min full suite

### Scalability Constraints
- Single-server deployment pattern
- Shared database for all services
- File-based static serving
- No CDN or distributed caching

### Resource Constraints
- Memory: <2GB total container usage
- Storage: Local volumes only
- Network: Single-host networking
- CPU: Single-threaded Python (GIL limitations)

## Security Boundaries

### Authentication Scope
- Django session-based auth
- CORS configured for localhost development
- No OAuth/external auth providers
- Admin interface via Django admin

### Data Protection Scope
- Database-level constraints only
- No encryption at rest
- Development secrets in environment
- No compliance requirements (GDPR, etc.)

## Extension Guidelines for Agents

### Safe Extensions (Encouraged)
- New Django models in `src/core/models/`
- New API endpoints in Django apps
- New React components following existing patterns
- New test files in appropriate agentic hierarchy
- Package additions with justification

### Requires Justification
- New microservices (prefer Django apps)
- Alternative databases (prefer PostgreSQL extensions)
- Breaking API changes
- Major dependency updates
- Infrastructure changes

### Forbidden Extensions
- Non-Python backend code
- Non-React frontend frameworks
- Alternative container orchestration
- Breaking test hierarchy structure
- Cross-service data dependencies outside API

This document bounds the decision space for all discriminator/critic agents operating on this codebase.