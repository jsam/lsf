# Green Phase Implementation Tasks

## Backend Implementation

GREEN-001: [RED-001, RED-002] Implement login view
- Task: Create `/api/auth/login/` view using `django.contrib.auth.authenticate()` and `login()`
- Implementation:
  - Create `src/core/views.py` function `auth_login(request)`
  - Use `authenticate(username=..., password=...)`
  - Call `login(request, user)` on success
  - Return `JsonResponse({"id": user.id, "username": user.username})` on success
  - Return `JsonResponse({"error": "Invalid credentials"}, status=401)` on failure
  - Handle missing fields with 400 status
- Component: Django built-in auth functions
- Verification: `pytest tests/integration/test_auth_backend.py::test_login_success` and `test_login_invalid_credentials` pass
- Dependencies: None (uses Django built-ins)
- Traceability: REQ-001, REQ-004

GREEN-002: [RED-001, RED-002] Add login URL route
- Task: Register `/api/auth/login/` in URL configuration
- Implementation:
  - Add to `src/core/urls.py`: `path('auth/login/', views.auth_login, name='auth_login')`
  - Ensure `src/django_celery_base/urls.py` includes `path('api/', include('core.urls'))`
- Component: Django URLconf
- Verification: Login tests pass, endpoint accessible
- Dependencies: GREEN-001
- Traceability: REQ-001

GREEN-003: [RED-003, RED-004, RED-005, RED-008] Implement /me endpoint with login_required
- Task: Create `/api/auth/me/` protected endpoint
- Implementation:
  - Create `src/core/views.py` function `auth_me(request)` with `@login_required` decorator
  - Return `JsonResponse({"id": request.user.id, "username": request.user.username})`
  - Django's `@login_required` handles 401 for unauthenticated requests
- Component: `django.contrib.auth.decorators.login_required`
- Verification: `pytest tests/integration/test_auth_backend.py::test_protected_endpoint_*` pass
- Dependencies: None (uses Django built-ins)
- Traceability: REQ-002, REQ-005

GREEN-004: [RED-003, RED-004, RED-005, RED-008] Add /me URL route
- Task: Register `/api/auth/me/` in URL configuration
- Implementation:
  - Add to `src/core/urls.py`: `path('auth/me/', views.auth_me, name='auth_me')`
- Component: Django URLconf
- Verification: Protected endpoint tests pass
- Dependencies: GREEN-003
- Traceability: REQ-002, REQ-005

GREEN-005: [RED-006, RED-007] Implement logout view
- Task: Create `/api/auth/logout/` view using `django.contrib.auth.logout()`
- Implementation:
  - Create `src/core/views.py` function `auth_logout(request)`
  - Call `logout(request)` to destroy session
  - Return `JsonResponse({"success": True})`
- Component: `django.contrib.auth.logout()`
- Verification: `pytest tests/integration/test_auth_backend.py::test_logout_*` pass
- Dependencies: None (uses Django built-ins)
- Traceability: REQ-003

GREEN-006: [RED-006, RED-007] Add logout URL route
- Task: Register `/api/auth/logout/` in URL configuration
- Implementation:
  - Add to `src/core/urls.py`: `path('auth/logout/', views.auth_logout, name='auth_logout')`
- Component: Django URLconf
- Verification: Logout tests pass
- Dependencies: GREEN-005
- Traceability: REQ-003

GREEN-007: [RED-010] Configure CSRF exemption for API endpoints (if needed)
- Task: Ensure CSRF middleware works correctly with session auth
- Implementation:
  - Verify CSRF middleware enabled in settings.py (already configured line 38)
  - Django TestClient automatically includes CSRF tokens
  - Frontend will handle CSRF token in headers
- Component: Django CSRF middleware (built-in)
- Verification: `pytest tests/integration/test_auth_backend.py::test_csrf_protection_login` passes
- Dependencies: None
- Traceability: REQ-505

GREEN-008: [RED-009] Create example Celery task with user context
- Task: Create Celery task that accepts user_id parameter
- Implementation:
  - Create `src/core/tasks.py` with `@shared_task` decorated function
  - Function signature: `example_user_task(user_id)`
  - Retrieve user: `User.objects.get(id=user_id)`
  - Return task result with user context
- Component: Celery `@shared_task` (existing)
- Verification: `pytest tests/integration/test_auth_backend.py::test_celery_task_with_user_context` passes
- Dependencies: None
- Traceability: REQ-502

GREEN-009: [RED-SETUP-005, RED-404] Configure session cookie settings
- Task: Add session security settings to Django configuration
- Implementation:
  - Add to `src/django_celery_base/settings.py`:
    - `SESSION_COOKIE_HTTPONLY = True`
    - `SESSION_COOKIE_SECURE = not DEBUG` (True in production)
    - `SESSION_COOKIE_SAMESITE = 'Lax'`
- Component: Django session settings (built-in)
- Verification: `pytest tests/security/test_auth_security.py::test_session_cookie_httponly` passes
- Dependencies: None
- Traceability: REQ-501

---

## Frontend Implementation

GREEN-101: [RED-104, RED-112, RED-113] Update API client for session auth
- Task: Modify `src/frontend/src/api/client.ts` to support session cookies and CSRF
- Implementation:
  - Add `credentials: 'include'` to fetch options (line 28)
  - Add CSRF token extraction from cookies
  - Add CSRF token to POST/PUT/DELETE request headers: `'X-CSRFToken': getCsrfToken()`
  - Implement `getCsrfToken()` utility to read `csrftoken` cookie
- Component: Existing api/client.ts
- Verification: `npm test -- tests/integration/ApiClient.test.tsx` tests pass
- Dependencies: None
- Traceability: REQ-102, REQ-505

GREEN-102: [RED-109] Adapt useAuth hook for session-based auth
- Task: Modify `src/frontend/src/hooks/useAuth.ts` to use sessions instead of tokens
- Implementation:
  - Remove token storage (localStorage for tokens)
  - Update `login()` to call `/api/auth/login/` (no token in response)
  - Update `logout()` to call `/api/auth/logout/`
  - Remove `refreshToken()` logic (sessions don't need refresh)
  - Update `getCurrentUser()` to call `/api/auth/me/` (relies on session cookie)
  - Keep `credentials: 'include'` in all API calls
  - On mount, call `/api/auth/me/` to check session validity
- Component: Existing useAuth.ts
- Verification: `npm test -- tests/integration/AuthContext.test.tsx` tests pass
- Dependencies: GREEN-101
- Traceability: REQ-106, REQ-107

GREEN-103: [RED-101, RED-102, RED-103] Create Login page component
- Task: Create `src/frontend/src/pages/Login.tsx`
- Implementation:
  - Import existing `Form`, `Input`, `Button` from `../components/ui/`
  - Use `useAuth()` hook for login function
  - Controlled form with username/password state
  - Call `login({ username, password })` on submit
  - Display error from `useAuth().error`
  - Redirect to `/` on successful login using `useNavigate()`
- Component: New Login.tsx using existing UI components
- Verification: `npm test -- tests/integration/Login.test.tsx` tests pass
- Dependencies: GREEN-102
- Traceability: REQ-101, REQ-105

GREEN-104: [RED-107, RED-108] Create ProtectedRoute component
- Task: Create `src/frontend/src/components/ProtectedRoute.tsx`
- Implementation:
  - Use `useAuth()` hook to check authentication state
  - If `loading`, show `<LoadingSpinner />` (existing component)
  - If not `isAuthenticated`, redirect to `/login` using `<Navigate to="/login" />`
  - If authenticated, render `{children}`
- Component: New ProtectedRoute.tsx
- Verification: `npm test -- tests/integration/ProtectedRoute.test.tsx` tests pass
- Dependencies: GREEN-102
- Traceability: REQ-103

GREEN-105: [RED-106] Update Header component with logout
- Task: Modify `src/frontend/src/components/layout/Header.tsx` to add logout button
- Implementation:
  - Import `useAuth()` hook
  - Add logout button in user menu area
  - Call `logout()` from useAuth on click
  - `useNavigate()` to redirect to `/login` after logout
- Component: Existing Header.tsx
- Verification: `npm test -- tests/integration/Header.test.tsx::test_logout_flow` passes
- Dependencies: GREEN-102
- Traceability: REQ-104

GREEN-106: [RED-110, RED-111] Update App.tsx with login route and auth provider
- Task: Modify `src/frontend/src/App.tsx` to add authentication routing
- Implementation:
  - Wrap app with `AuthProvider` (using AuthContext from useAuth)
  - Add `/login` route without AdminLayout:
    ```tsx
    <Route path="/login" element={<Login />} />
    ```
  - Wrap existing routes with `<ProtectedRoute><AdminLayout>...</AdminLayout></ProtectedRoute>`
  - Conditional layout: login page standalone, authenticated pages with AdminLayout
- Component: Existing App.tsx
- Verification: `npm test -- tests/integration/App.test.tsx` tests pass
- Dependencies: GREEN-103, GREEN-104
- Traceability: REQ-504

GREEN-107: [RED-105] Implement session persistence in AuthContext
- Task: Ensure AuthContext checks session on mount
- Implementation:
  - In `useEffect` on mount, call `/api/auth/me/` with session cookie
  - If successful, set user state
  - If 401, clear auth state (no valid session)
  - Browser manages session cookie persistence automatically
- Component: Modification to useAuth.ts
- Verification: `npm test -- tests/integration/AuthContext.test.tsx::test_session_persistence_on_refresh` passes
- Dependencies: GREEN-102
- Traceability: REQ-107

---

## Integration Tasks

GREEN-201: [RED-201, RED-202, RED-203] Contract tests implementation
- Task: Contract tests verify actual endpoint behavior (pass once endpoints implemented)
- Implementation:
  - Tests validate endpoint schemas match API contracts
  - No additional implementation needed beyond GREEN-001 through GREEN-006
  - Contract tests document expected API structure
- Component: Test validation only
- Verification: `pytest tests/contract/test_auth_api.py` all tests pass
- Dependencies: GREEN-001 through GREEN-006
- Traceability: REQ-001, REQ-003, REQ-005

GREEN-401: [RED-401, RED-403, RED-405] Security tests validation
- Task: Security tests verify Django default security behavior
- Implementation:
  - Tampered session rejection: Django validates session signature automatically
  - Logout invalidation: Django's `logout()` deletes session
  - CSRF protection: Django CSRF middleware validates tokens
  - No additional implementation needed (Django built-in security)
- Component: Django security defaults
- Verification: `pytest tests/security/test_auth_security.py` relevant tests pass
- Dependencies: GREEN-001 through GREEN-006, GREEN-009
- Traceability: REQ-002, REQ-003, REQ-501, REQ-505

GREEN-402: [RED-402] Session hijacking documentation test
- Task: Document Django session security behavior
- Implementation:
  - Test documents that Django sessions are secure by default
  - Session cookies httpOnly prevents JavaScript access
  - Optional: Document how to add IP/user-agent validation if needed
  - Test may pass without additional code (documents behavior)
- Component: Documentation test
- Verification: `pytest tests/security/test_auth_security.py::test_session_security` passes
- Dependencies: GREEN-009
- Traceability: REQ-002

GREEN-403: [RED-404] Verify session cookie httpOnly configuration
- Task: Configuration task completed by GREEN-009
- Implementation: Verified by security test
- Component: Django session settings
- Verification: `pytest tests/security/test_auth_security.py::test_session_cookie_httponly` passes
- Dependencies: GREEN-009
- Traceability: REQ-501

---

## Execution Order

**Phase 1: Backend Foundation**
1. GREEN-009 (session settings)
2. GREEN-001, GREEN-002 (login endpoint)
3. GREEN-003, GREEN-004 (/me endpoint)
4. GREEN-005, GREEN-006 (logout endpoint)
5. GREEN-007 (CSRF configuration verification)
6. GREEN-008 (Celery example task)

**Phase 2: Frontend Foundation**
7. GREEN-101 (API client session support)
8. GREEN-102 (useAuth adaptation)

**Phase 3: Frontend Components**
9. GREEN-103 (Login page)
10. GREEN-104 (ProtectedRoute)
11. GREEN-105 (Header logout)
12. GREEN-107 (session persistence)
13. GREEN-106 (App routing integration)

**Phase 4: Validation**
14. GREEN-201 (contract tests)
15. GREEN-401, GREEN-402, GREEN-403 (security tests)

---

## Summary

- **Total GREEN Tasks**: 16 implementation tasks
- **Backend Tasks**: 9 (views + routes + config)
- **Frontend Tasks**: 7 (components + hooks + routing)
- **New Files Created**: 2 (Login.tsx, ProtectedRoute.tsx)
- **Modified Files**: 6 (views.py, urls.py, settings.py, client.ts, useAuth.ts, App.tsx, Header.tsx)
- **New Models**: 0 (Django built-ins only)
- **New Dependencies**: 0 (uses existing stack)

---

## Minimal Implementation Principles

**Backend:**
- Use Django built-in auth functions only
- No custom authentication logic
- No DRF dependency
- JsonResponse for API responses
- Standard Django views (no class-based views per architecture-boundaries.md:119)

**Frontend:**
- Reuse existing UI components (Form, Input, Button)
- Adapt existing useAuth hook (don't rewrite)
- Minimal new components (Login, ProtectedRoute only)
- Browser manages session cookies (no manual storage)
- No token refresh logic (sessions don't need it)

**Security:**
- Django defaults for session security
- CSRF middleware (already configured)
- httpOnly cookies (configured)
- No additional security libraries needed

---
<!--
Layer: 3B
Type: green-phase
Derived-from: red-phase.md
Implementation-Strategy: Minimal, Django built-ins, existing components
-->
