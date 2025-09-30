# Test Specifications

## Backend Integration Tests

TEST-001: [REQ-001→OUT-001,OUT-002]
- Input: POST /api/auth/login/ with {"username": "testuser", "password": "testpass123"}
- Action: Django authenticates credentials, creates session
- Expected: Status 200, session cookie set, response {"id": 1, "username": "testuser"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_login_success`

TEST-002: [REQ-001,REQ-004→OUT-006]
- Input: POST /api/auth/login/ with {"username": "wrong", "password": "wrong"}
- Action: Django authentication fails
- Expected: Status 401, no session cookie, response {"error": "Invalid credentials"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_login_invalid_credentials`

TEST-003: [REQ-002→OUT-003]
- Input: GET /api/auth/me/ with valid session cookie
- Action: @login_required decorator validates session
- Expected: Status 200, response {"id": 1, "username": "testuser"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_protected_endpoint_authenticated`

TEST-004: [REQ-002→OUT-003]
- Input: GET /api/auth/me/ with no session cookie
- Action: @login_required decorator checks authentication
- Expected: Status 401, response {"error": "Authentication required"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_protected_endpoint_unauthenticated`

TEST-005: [REQ-002→OUT-003]
- Input: GET /api/auth/me/ with expired session cookie
- Action: Django session validation fails
- Expected: Status 401, response {"error": "Session expired"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_protected_endpoint_expired_session`

TEST-006: [REQ-003→OUT-005]
- Input: POST /api/auth/logout/ with valid session
- Action: Django logout() destroys session
- Expected: Status 200, session cookie deleted, response {"success": true}
- Verify: `pytest tests/integration/test_auth_backend.py::test_logout_success`

TEST-007: [REQ-003→OUT-005]
- Input: GET /api/auth/me/ after logout
- Action: Session validation fails
- Expected: Status 401, response {"error": "Authentication required"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_logout_invalidates_session`

TEST-008: [REQ-005→OUT-003]
- Input: GET /api/auth/me/ with valid session
- Action: Protected endpoint returns request.user data
- Expected: Status 200, response {"id": 1, "username": "testuser"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_get_current_user`

TEST-009: [REQ-502→OUT-003]
- Input: Celery task invoked with user_id from authenticated request
- Action: Task retrieves User.objects.get(id=user_id)
- Expected: Task completes with correct user context
- Verify: `pytest tests/integration/test_auth_backend.py::test_celery_task_with_user_context`

TEST-010: [REQ-505→OUT-002]
- Input: POST /api/auth/login/ without CSRF token
- Action: Django CSRF middleware validates token
- Expected: Status 403, response {"error": "CSRF validation failed"}
- Verify: `pytest tests/integration/test_auth_backend.py::test_csrf_protection_login`

## Frontend Integration Tests

TEST-101: [REQ-101→OUT-001]
- Input: Render Login component
- Action: Component mounts with username/password inputs and submit button
- Expected: Form rendered, inputs accept text, button clickable
- Verify: `npm test -- tests/integration/Login.test.tsx --test test_login_form_renders`

TEST-102: [REQ-101,REQ-102→OUT-001,OUT-002]
- Input: User types "testuser"/"testpass123" and clicks submit
- Action: Form calls API client login() with credentials: 'include'
- Expected: POST /api/auth/login/ called, session cookie stored by browser
- Verify: `npm test -- tests/integration/Login.test.tsx --test test_login_form_submission`

TEST-103: [REQ-105→OUT-006]
- Input: API returns 401 with {"error": "Invalid credentials"}
- Action: Login component displays error message
- Expected: Error text "Invalid credentials" visible below form
- Verify: `npm test -- tests/integration/Login.test.tsx --test test_login_error_display`

TEST-104: [REQ-102→OUT-002,OUT-003]
- Input: API client makes authenticated request after login
- Action: Fetch includes credentials: 'include', browser sends session cookie
- Expected: Request Cookie header contains sessionid
- Verify: `npm test -- tests/integration/ApiClient.test.tsx --test test_credentials_included`

TEST-105: [REQ-107→OUT-004]
- Input: Browser refresh after successful login
- Action: AuthContext calls /api/auth/me/ on mount with session cookie
- Expected: User state restored from session validation
- Verify: `npm test -- tests/integration/AuthContext.test.tsx --test test_session_persistence_on_refresh`

TEST-106: [REQ-104→OUT-005]
- Input: User clicks logout button in Header
- Action: Logout handler calls /api/auth/logout/, clears auth state
- Expected: POST /api/auth/logout/ called, user state null, navigation to /login
- Verify: `npm test -- tests/integration/Header.test.tsx --test test_logout_flow`

TEST-107: [REQ-103→OUT-003]
- Input: Unauthenticated user navigates to /dashboard (protected route)
- Action: ProtectedRoute checks user state from useAuth()
- Expected: User redirected to /login
- Verify: `npm test -- tests/integration/ProtectedRoute.test.tsx --test test_redirect_when_unauthenticated`

TEST-108: [REQ-103→OUT-003]
- Input: Authenticated user navigates to /dashboard (protected route)
- Action: ProtectedRoute validates user exists in AuthContext
- Expected: Dashboard component renders
- Verify: `npm test -- tests/integration/ProtectedRoute.test.tsx --test test_render_when_authenticated`

TEST-109: [REQ-106→OUT-003]
- Input: Component calls useAuth() hook
- Action: AuthContext provides user state
- Expected: Hook returns {user: {id, username}, login: fn, logout: fn, loading: false, error: null}
- Verify: `npm test -- tests/integration/AuthContext.test.tsx --test test_auth_context_provides_state`

TEST-110: [REQ-504→OUT-001]
- Input: User navigates to /login
- Action: Router renders Login component without AdminLayout
- Expected: Login page visible, no sidebar/header from AdminLayout
- Verify: `npm test -- tests/integration/App.test.tsx --test test_login_route_no_layout`

TEST-111: [REQ-504→OUT-003]
- Input: Authenticated user navigates to /dashboard
- Action: Router renders Dashboard with AdminLayout
- Expected: Dashboard content visible inside AdminLayout (sidebar + header present)
- Verify: `npm test -- tests/integration/App.test.tsx --test test_protected_route_with_layout`

TEST-112: [REQ-505→OUT-002]
- Input: Login form submission
- Action: API client extracts CSRF token from cookie, includes in X-CSRFToken header
- Expected: POST request includes X-CSRFToken header with valid token
- Verify: `npm test -- tests/integration/ApiClient.test.tsx --test test_csrf_token_included`

TEST-113: [REQ-505→OUT-002]
- Input: Page load before any POST requests
- Action: Initial GET request to fetch CSRF token cookie
- Expected: csrftoken cookie available before login submission
- Verify: `npm test -- tests/integration/ApiClient.test.tsx --test test_csrf_token_available`

## Contract Tests

TEST-201: [REQ-001→OUT-002]
- Endpoint: /api/auth/login/
- Method: POST
- Payload: {"username": "string", "password": "string"}
- Response: 200, {"id": number, "username": "string"}, Set-Cookie: sessionid
- Verify: `pytest tests/contract/test_auth_api.py::test_login_contract`

TEST-202: [REQ-003→OUT-005]
- Endpoint: /api/auth/logout/
- Method: POST
- Payload: None (session cookie required)
- Response: 200, {"success": true}, Set-Cookie: sessionid="" (delete)
- Verify: `pytest tests/contract/test_auth_api.py::test_logout_contract`

TEST-203: [REQ-005→OUT-003]
- Endpoint: /api/auth/me/
- Method: GET
- Payload: None (session cookie required)
- Response: 200, {"id": number, "username": "string"}
- Verify: `pytest tests/contract/test_auth_api.py::test_me_contract`

## Performance Tests

TEST-301: [REQ-401→OUT-002]
- Scenario: User login request
- Concurrency: 10 simultaneous logins
- Duration: 10s
- Success: p95 latency < 500ms
- Verify: `pytest tests/performance/test_auth_performance.py::test_login_latency`

TEST-302: [REQ-402→OUT-003]
- Scenario: Protected endpoint access with session validation
- Concurrency: 50 requests with valid sessions
- Duration: 10s
- Success: p95 latency < 50ms
- Verify: `pytest tests/performance/test_auth_performance.py::test_validation_latency`

TEST-303: [REQ-403→OUT-005]
- Scenario: User logout requests
- Concurrency: 10 simultaneous logouts
- Duration: 10s
- Success: p95 latency < 200ms
- Verify: `pytest tests/performance/test_auth_performance.py::test_logout_latency`

## Security Tests

TEST-401: [REQ-002→OUT-003]
- Failure: Tampered session cookie
- Behavior: Request rejected with 401
- Recovery: Immediate rejection, no data exposure
- Verify: `pytest tests/security/test_auth_security.py::test_tampered_session_rejected`

TEST-402: [REQ-002→OUT-003]
- Failure: Session hijacking attempt with stolen cookie
- Behavior: Session validated but user-agent/IP mismatch detection possible
- Recovery: Optional security hardening via custom session backend
- Verify: `pytest tests/security/test_auth_security.py::test_session_security`

TEST-403: [REQ-003→OUT-005]
- Failure: Attempt to use session after logout
- Behavior: Session validation fails with 401
- Recovery: User forced to re-authenticate
- Verify: `pytest tests/security/test_auth_security.py::test_logout_invalidates_session`

TEST-404: [REQ-501→OUT-003]
- Failure: Session cookie accessed by JavaScript (XSS attempt)
- Behavior: httpOnly flag prevents document.cookie access
- Recovery: Cookie remains secure even if XSS vulnerability exists
- Verify: `pytest tests/security/test_auth_security.py::test_session_cookie_httponly`

TEST-405: [REQ-505→OUT-002]
- Failure: CSRF attack attempt without valid token
- Behavior: Request rejected with 403
- Recovery: State-changing request blocked, session unchanged
- Verify: `pytest tests/security/test_auth_security.py::test_csrf_protection`

---
<!--
Layer: 2
Type: test-cases
Requirements: requirements.md
Test-runner: pytest/vitest
Compliance: Django session auth
-->
