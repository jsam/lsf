# Red Phase Tasks

## Setup Tasks

RED-SETUP-001: [Infrastructure] Create backend auth test file structure
- Task: Create `tests/integration/test_auth_backend.py` with Django TestCase setup
- Expected Failure: N/A (setup task)
- Verification: File exists with test class scaffolding
- Dependencies: None
- Traceability: Supports TEST-001 through TEST-010

RED-SETUP-002: [Infrastructure] Create frontend auth test file structure
- Task: Create test files: `Login.test.tsx`, `ApiClient.test.tsx`, `AuthContext.test.tsx`, `ProtectedRoute.test.tsx`, `App.test.tsx`
- Expected Failure: N/A (setup task)
- Verification: Files exist in `src/frontend/tests/integration/` with Vitest setup
- Dependencies: None
- Traceability: Supports TEST-101 through TEST-113

RED-SETUP-003: [Infrastructure] Create backend contract test file
- Task: Create `tests/contract/test_auth_api.py` with API schema validation setup
- Expected Failure: N/A (setup task)
- Verification: File exists with contract test scaffolding
- Dependencies: None
- Traceability: Supports TEST-201 through TEST-203

RED-SETUP-004: [Infrastructure] Create backend security test file
- Task: Create `tests/security/test_auth_security.py` with security test setup
- Expected Failure: N/A (setup task)
- Verification: File exists with security test scaffolding
- Dependencies: None
- Traceability: Supports TEST-401 through TEST-405

RED-SETUP-005: [Configuration] Configure Django session settings
- Task: Add SESSION_COOKIE_HTTPONLY, SESSION_COOKIE_SECURE, SESSION_COOKIE_SAMESITE to settings.py
- Expected Failure: N/A (configuration task)
- Verification: Settings configured per REQ-501
- Dependencies: None
- Traceability: REQ-501, TEST-404

---

## Backend Integration Tests

RED-001: [TEST-001] Implement login success test
- Task: Write test for POST /api/auth/login/ with valid credentials
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_login_success` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-001 → REQ-001 → OUT-001, OUT-002

RED-002: [TEST-002] Implement login invalid credentials test
- Task: Write test for POST /api/auth/login/ with invalid credentials
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_login_invalid_credentials` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-002 → REQ-001, REQ-004 → OUT-006

RED-003: [TEST-003] Implement protected endpoint authenticated test
- Task: Write test for GET /api/auth/me/ with valid session cookie
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_protected_endpoint_authenticated` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-003 → REQ-002 → OUT-003

RED-004: [TEST-004] Implement protected endpoint unauthenticated test
- Task: Write test for GET /api/auth/me/ without session cookie
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_protected_endpoint_unauthenticated` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-004 → REQ-002 → OUT-003

RED-005: [TEST-005] Implement protected endpoint expired session test
- Task: Write test for GET /api/auth/me/ with expired session cookie
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_protected_endpoint_expired_session` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-005 → REQ-002 → OUT-003

RED-006: [TEST-006] Implement logout success test
- Task: Write test for POST /api/auth/logout/ with valid session
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_logout_success` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-006 → REQ-003 → OUT-005

RED-007: [TEST-007] Implement logout invalidates session test
- Task: Write test for GET /api/auth/me/ after logout
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_logout_invalidates_session` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-007 → REQ-003 → OUT-005

RED-008: [TEST-008] Implement get current user test
- Task: Write test for GET /api/auth/me/ returning user data
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_get_current_user` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-008 → REQ-005 → OUT-003

RED-009: [TEST-009] Implement Celery user context test
- Task: Write test for Celery task with user_id parameter
- Expected Failure: ImportError or task doesn't exist
- Verification: `pytest tests/integration/test_auth_backend.py::test_celery_task_with_user_context` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-009 → REQ-502 → OUT-003

RED-010: [TEST-010] Implement CSRF protection login test
- Task: Write test for POST /api/auth/login/ without CSRF token
- Expected Failure: ImportError or 404 (endpoint doesn't exist yet)
- Verification: `pytest tests/integration/test_auth_backend.py::test_csrf_protection_login` fails
- Dependencies: RED-SETUP-001
- Traceability: TEST-010 → REQ-505 → OUT-002

---

## Frontend Integration Tests

RED-101: [TEST-101] Implement login form render test
- Task: Write test for Login component rendering
- Expected Failure: Component doesn't exist, import error
- Verification: `npm test -- tests/integration/Login.test.tsx --test test_login_form_renders` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-101 → REQ-101 → OUT-001

RED-102: [TEST-102] Implement login form submission test
- Task: Write test for Login form submission flow
- Expected Failure: Component doesn't exist, import error
- Verification: `npm test -- tests/integration/Login.test.tsx --test test_login_form_submission` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-102 → REQ-101, REQ-102 → OUT-001, OUT-002

RED-103: [TEST-103] Implement login error display test
- Task: Write test for Login component error message display
- Expected Failure: Component doesn't exist, import error
- Verification: `npm test -- tests/integration/Login.test.tsx --test test_login_error_display` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-103 → REQ-105 → OUT-006

RED-104: [TEST-104] Implement API client credentials test
- Task: Write test for API client including credentials in requests
- Expected Failure: API client method doesn't exist or credentials not included
- Verification: `npm test -- tests/integration/ApiClient.test.tsx --test test_credentials_included` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-104 → REQ-102 → OUT-002, OUT-003

RED-105: [TEST-105] Implement session persistence test
- Task: Write test for AuthContext restoring state on refresh
- Expected Failure: AuthContext doesn't support sessions, import error
- Verification: `npm test -- tests/integration/AuthContext.test.tsx --test test_session_persistence_on_refresh` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-105 → REQ-107 → OUT-004

RED-106: [TEST-106] Implement logout flow test
- Task: Write test for logout button in Header
- Expected Failure: Logout method doesn't exist or doesn't work correctly
- Verification: `npm test -- tests/integration/Header.test.tsx --test test_logout_flow` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-106 → REQ-104 → OUT-005

RED-107: [TEST-107] Implement protected route redirect test
- Task: Write test for ProtectedRoute redirecting unauthenticated users
- Expected Failure: Component doesn't exist, import error
- Verification: `npm test -- tests/integration/ProtectedRoute.test.tsx --test test_redirect_when_unauthenticated` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-107 → REQ-103 → OUT-003

RED-108: [TEST-108] Implement protected route render test
- Task: Write test for ProtectedRoute rendering for authenticated users
- Expected Failure: Component doesn't exist, import error
- Verification: `npm test -- tests/integration/ProtectedRoute.test.tsx --test test_render_when_authenticated` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-108 → REQ-103 → OUT-003

RED-109: [TEST-109] Implement AuthContext state test
- Task: Write test for useAuth hook providing correct state
- Expected Failure: useAuth doesn't support sessions or returns wrong structure
- Verification: `npm test -- tests/integration/AuthContext.test.tsx --test test_auth_context_provides_state` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-109 → REQ-106 → OUT-003

RED-110: [TEST-110] Implement login route without layout test
- Task: Write test for /login route rendering without AdminLayout
- Expected Failure: Route doesn't exist or layout incorrect
- Verification: `npm test -- tests/integration/App.test.tsx --test test_login_route_no_layout` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-110 → REQ-504 → OUT-001

RED-111: [TEST-111] Implement protected route with layout test
- Task: Write test for authenticated routes rendering with AdminLayout
- Expected Failure: Route logic incorrect or layout missing
- Verification: `npm test -- tests/integration/App.test.tsx --test test_protected_route_with_layout` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-111 → REQ-504 → OUT-003

RED-112: [TEST-112] Implement CSRF token inclusion test
- Task: Write test for API client including CSRF token in POST requests
- Expected Failure: CSRF token not extracted or not included in header
- Verification: `npm test -- tests/integration/ApiClient.test.tsx --test test_csrf_token_included` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-112 → REQ-505 → OUT-002

RED-113: [TEST-113] Implement CSRF token availability test
- Task: Write test for CSRF token cookie being available
- Expected Failure: CSRF token not fetched or cookie missing
- Verification: `npm test -- tests/integration/ApiClient.test.tsx --test test_csrf_token_available` fails
- Dependencies: RED-SETUP-002
- Traceability: TEST-113 → REQ-505 → OUT-002

---

## Contract Tests

RED-201: [TEST-201] Implement login contract test
- Task: Write contract test for /api/auth/login/ endpoint schema
- Expected Failure: Endpoint doesn't exist or schema mismatch
- Verification: `pytest tests/contract/test_auth_api.py::test_login_contract` fails
- Dependencies: RED-SETUP-003
- Traceability: TEST-201 → REQ-001 → OUT-002

RED-202: [TEST-202] Implement logout contract test
- Task: Write contract test for /api/auth/logout/ endpoint schema
- Expected Failure: Endpoint doesn't exist or schema mismatch
- Verification: `pytest tests/contract/test_auth_api.py::test_logout_contract` fails
- Dependencies: RED-SETUP-003
- Traceability: TEST-202 → REQ-003 → OUT-005

RED-203: [TEST-203] Implement me endpoint contract test
- Task: Write contract test for /api/auth/me/ endpoint schema
- Expected Failure: Endpoint doesn't exist or schema mismatch
- Verification: `pytest tests/contract/test_auth_api.py::test_me_contract` fails
- Dependencies: RED-SETUP-003
- Traceability: TEST-203 → REQ-005 → OUT-003

---

## Security Tests

RED-401: [TEST-401] Implement tampered session test
- Task: Write test for tampered session cookie rejection
- Expected Failure: Endpoint doesn't exist or validation missing
- Verification: `pytest tests/security/test_auth_security.py::test_tampered_session_rejected` fails
- Dependencies: RED-SETUP-004
- Traceability: TEST-401 → REQ-002 → OUT-003

RED-402: [TEST-402] Implement session hijacking test
- Task: Write test documenting session security behavior
- Expected Failure: Endpoint doesn't exist (test may pass with default Django behavior)
- Verification: `pytest tests/security/test_auth_security.py::test_session_security` fails
- Dependencies: RED-SETUP-004
- Traceability: TEST-402 → REQ-002 → OUT-003

RED-403: [TEST-403] Implement logout invalidation security test
- Task: Write test for session invalidation after logout
- Expected Failure: Endpoint doesn't exist or session not invalidated
- Verification: `pytest tests/security/test_auth_security.py::test_logout_invalidates_session` fails
- Dependencies: RED-SETUP-004
- Traceability: TEST-403 → REQ-003 → OUT-005

RED-404: [TEST-404] Implement httpOnly cookie test
- Task: Write test for session cookie httpOnly flag
- Expected Failure: Configuration missing or flag not set
- Verification: `pytest tests/security/test_auth_security.py::test_session_cookie_httponly` fails
- Dependencies: RED-SETUP-004, RED-SETUP-005
- Traceability: TEST-404 → REQ-501 → OUT-003

RED-405: [TEST-405] Implement CSRF protection test
- Task: Write test for CSRF attack prevention
- Expected Failure: Endpoint doesn't exist or CSRF not validated
- Verification: `pytest tests/security/test_auth_security.py::test_csrf_protection` fails
- Dependencies: RED-SETUP-004
- Traceability: TEST-405 → REQ-505 → OUT-002

---

## Performance Tests (Deferred)

Note: Performance tests TEST-301, TEST-302, TEST-303 are deferred to post-green optimization phase per TDD best practices. Focus on functional correctness first.

---

## Execution Order

**Phase 1: Setup** (parallel execution possible)
1. RED-SETUP-001 through RED-SETUP-005

**Phase 2: Backend Core** (sequential recommended)
2. RED-001, RED-002 (login tests)
3. RED-003, RED-004, RED-005 (protected endpoint tests)
4. RED-006, RED-007, RED-008 (logout and user tests)
5. RED-010 (CSRF test)
6. RED-009 (Celery test - depends on auth endpoints)

**Phase 3: Frontend Core** (sequential recommended)
7. RED-104, RED-112, RED-113 (API client CSRF/credentials foundation)
8. RED-109 (AuthContext adaptation)
9. RED-101, RED-102, RED-103 (Login component)
10. RED-105 (session persistence)
11. RED-107, RED-108 (ProtectedRoute component)
12. RED-106 (logout integration with Header)
13. RED-110, RED-111 (App router integration)

**Phase 4: Contracts** (after backend core)
14. RED-201, RED-202, RED-203

**Phase 5: Security** (after functional tests pass)
15. RED-401 through RED-405

---

## Summary

- **Total RED Tasks**: 33 (5 setup + 28 tests)
- **Backend Tests**: 13 (10 integration + 3 contract)
- **Frontend Tests**: 13 integration
- **Security Tests**: 5
- **Performance Tests**: 3 (deferred)
- **New Models Required**: 0 (Django built-ins only)

---
<!--
Layer: 3A
Type: red-phase
Derived-from: test-cases.md
Test-Framework: pytest (backend), vitest (frontend)
-->
