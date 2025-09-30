# Feature: Basic JWT Authentication (Full-Stack)

**Scope**: This feature requires both Django backend API endpoints AND React frontend UI components.

## User Outcomes
What users can do with this feature:
- [OUT-001] User sees a login form in React frontend to enter username/password
- [OUT-002] User authenticates and receives JWT tokens stored in browser
- [OUT-003] User can access protected pages in React app with automatic token validation
- [OUT-004] User can refresh expired access tokens transparently without re-login
- [OUT-005] User can logout via UI button, clearing tokens and returning to login
- [OUT-006] User receives clear error messages for authentication failures in the UI

## Success Criteria
Feature works when:

**Backend (Django):**
- [ ] Login endpoint returns JWT access and refresh tokens for valid credentials
- [ ] Protected API endpoints validate JWT tokens and reject invalid/expired tokens
- [ ] Token refresh endpoint exchanges valid refresh token for new access token
- [ ] JWT authentication works with Celery background tasks

**Frontend (React):**
- [ ] Login page component renders with username/password form
- [ ] API client automatically attaches JWT tokens to authenticated requests
- [ ] Protected routes redirect unauthenticated users to login page
- [ ] Authentication state persists across browser refreshes (stored tokens)
- [ ] Logout button clears tokens and redirects to login
- [ ] Auth context/hook provides user state to all React components
- [ ] Token refresh happens automatically before access token expires

## Constraints
External limitations:
- **Backend dependencies**: djangorestframework and djangorestframework-simplejwt (already installed)
- **Frontend location**: React app in `src/frontend/` with existing fetch-based API client
- **Integration points**: Must work with existing AdminLayout and Router setup in App.tsx
- **Celery support**: JWT authentication must work for background task user context
- **Security requirement**: Access tokens expire after 5 minutes, refresh tokens after 24 hours
- **CORS**: Must work with existing CORS configuration for localhost:3000
- **Token storage**: Use localStorage for persistence across browser sessions
- **No email features**: Basic username/password only (password reset, email verification deferred)

---
<!--
Agent parsing markers - DO NOT MODIFY
Layer: 1
Type: human-spec
Version: 1.0
-->
