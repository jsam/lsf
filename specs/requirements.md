# Technical Requirements

## Functional Constraints

### Backend Authentication

REQ-001: [OUT-001, OUT-002]
- Constraint: Django session-based authentication endpoint accepts username/password and creates session
- Component: django.contrib.auth.authenticate() and login() (built-in)
- Acceptance: POST /api/auth/login/ with valid credentials creates session cookie, returns user data
- Priority: MUST

REQ-002: [OUT-003]
- Constraint: Protected API endpoints validate Django session and reject unauthenticated requests
- Component: django.contrib.auth.decorators.login_required (built-in, architecture-boundaries.md:272)
- Acceptance: Request with valid session cookie succeeds, missing/invalid session returns 401
- Priority: MUST

REQ-003: [OUT-005]
- Constraint: Logout endpoint destroys Django session and clears session cookie
- Component: django.contrib.auth.logout() (built-in)
- Acceptance: POST /api/auth/logout/ clears session, subsequent requests unauthenticated
- Priority: MUST

REQ-004: [OUT-006]
- Constraint: Authentication endpoints return structured error messages for failures
- Component: Django JsonResponse with error field (architecture-boundaries.md:24)
- Acceptance: Invalid credentials return 401 with {"error": "message"}, missing fields return 400
- Priority: MUST

REQ-005: [OUT-003]
- Constraint: Protected endpoint returns current authenticated user data
- Component: request.user from Django auth middleware (built-in)
- Acceptance: GET /api/auth/me/ returns {"id", "username"} for authenticated session, 401 otherwise
- Priority: MUST

### Frontend Authentication

REQ-101: [OUT-001]
- Constraint: React login page component with controlled form inputs for username/password
- Component: New Login.tsx using existing Form, Input, Button from ui/ (architecture-boundaries.md:51-52)
- Acceptance: Login form renders, captures input, calls login API on submit
- Priority: MUST

REQ-102: [OUT-002, OUT-003]
- Constraint: API client sends credentials: 'include' with all requests to maintain session cookies
- Component: Extend existing api/client.ts fetch options (src/frontend/src/api/client.ts:28)
- Acceptance: All API requests include credentials, browser manages session cookies automatically
- Priority: MUST

REQ-103: [OUT-003]
- Constraint: Protected routes check authentication status and redirect to login when unauthenticated
- Component: New ProtectedRoute wrapper using React Router (architecture-boundaries.md:32)
- Acceptance: Unauthenticated navigation to protected route redirects to /login
- Priority: MUST

REQ-104: [OUT-005]
- Constraint: Logout button calls logout API and redirects to login page
- Component: Logout handler in AuthContext, button in existing Header (architecture-boundaries.md:43)
- Acceptance: Logout click calls API, clears auth state, redirects to /login
- Priority: MUST

REQ-105: [OUT-006]
- Constraint: Login form displays error messages from API failures
- Component: Error state in Login.tsx with error display
- Acceptance: Invalid credentials show error message, validation errors highlighted
- Priority: MUST

REQ-106: [OUT-003]
- Constraint: React Context provides authentication state to all components
- Component: New AuthContext with useAuth hook (architecture-boundaries.md:62)
- Acceptance: useAuth() returns {user, login, logout, loading, error} to any component
- Priority: MUST

REQ-107: [OUT-004]
- Constraint: Authentication state persists across browser refreshes via session cookie
- Component: Browser-managed session cookie from Django (httpOnly, secure)
- Acceptance: Page refresh maintains auth state if session cookie valid
- Priority: MUST

## Integration Constraints

REQ-201: [OUT-003]
- System: Django backend session validation
- Protocol: HTTP with session cookie
- Format: Django session cookie in Cookie header

REQ-202: [OUT-001, OUT-002]
- System: Django auth User model for credential validation
- Protocol: Django ORM
- Format: Django User model with username/password fields (architecture-boundaries.md:16)

REQ-203: [OUT-003]
- System: CSRF protection for state-changing requests
- Protocol: HTTP with CSRF token
- Format: X-CSRFToken header or csrfmiddlewaretoken in body

## Data Constraints

REQ-301: [OUT-002, OUT-003]
- Entity: Django session
- Volume: 1 session per authenticated user
- Persistence: django_session table (Django managed)

REQ-302: [OUT-003]
- Entity: User authentication state
- Volume: Single user object per session
- Persistence: React Context (memory), session validated on mount

## Performance Constraints

REQ-401: [OUT-002]
- Metric: LATENCY
- Target: <500ms for login endpoint
- Scope: PER_REQUEST

REQ-402: [OUT-003]
- Metric: LATENCY
- Target: <50ms for session validation on protected endpoints
- Scope: PER_REQUEST

REQ-403: [OUT-005]
- Metric: LATENCY
- Target: <200ms for logout endpoint
- Scope: PER_REQUEST

## Architecture Constraints

REQ-501: [OUT-003]
- Constraint: Use Django session settings for cookie configuration (secure, httpOnly, sameSite)
- Component: SESSION_COOKIE_* settings in django_celery_base/settings.py
- Acceptance: Session cookies httpOnly=True, secure=True in production, sameSite=Lax
- Priority: MUST

REQ-502: [OUT-003]
- Constraint: Django session authentication compatible with Celery task user context
- Component: Pass request.user.id to Celery task from authenticated view
- Acceptance: Celery task receives user_id parameter, retrieves User.objects.get(id=user_id)
- Priority: MUST

REQ-503: [OUT-001 through OUT-006]
- Constraint: CORS configuration allows credentials for session cookies
- Component: CORS_ALLOW_CREDENTIALS=True in settings.py (already configured, line 131)
- Acceptance: Preflight OPTIONS requests succeed, cookies sent cross-origin
- Priority: MUST

REQ-504: [OUT-001]
- Constraint: Login route integration with existing App.tsx Router and AdminLayout
- Component: Add /login route to Routes, conditional AdminLayout rendering
- Acceptance: /login renders without AdminLayout, authenticated routes render with AdminLayout
- Priority: MUST

REQ-505: [OUT-002, OUT-003]
- Constraint: CSRF token handling for login/logout POST requests
- Component: Django CSRF middleware (already configured, settings.py:38)
- Acceptance: Frontend extracts CSRF token from cookie, includes in POST request header
- Priority: MUST

---
<!--
Layer: 2
Type: requirements
Derived-from: human-spec-basic-login.md
Compliance: Django session auth per architecture-boundaries.md:256
-->
