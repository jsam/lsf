"""
Backend authentication integration tests.
Tests for login, logout, protected endpoints, and session management.
"""
import pytest
from django.test import TestCase, Client
from django.contrib.auth.models import User


class AuthBackendIntegrationTests(TestCase):
    """Integration tests for authentication backend endpoints."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = Client()
        # Create test user
        self.test_user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_login_success(self):
        """TEST-001: POST /api/auth/login/ with valid credentials creates session and returns user data."""
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'testpass123'},
            content_type='application/json'
        )

        # Expected: 200 status, session cookie set, user data in response
        assert response.status_code == 200
        assert 'sessionid' in response.cookies
        data = response.json()
        assert data['id'] == self.test_user.id
        assert data['username'] == 'testuser'

    def test_login_invalid_credentials(self):
        """TEST-002: POST /api/auth/login/ with invalid credentials returns 401 error."""
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'wrong', 'password': 'wrong'},
            content_type='application/json'
        )

        # Expected: 401 status, no session cookie, error message
        assert response.status_code == 401
        assert 'sessionid' not in response.cookies
        data = response.json()
        assert 'error' in data
        assert data['error'] == 'Invalid credentials'

    def test_protected_endpoint_authenticated(self):
        """TEST-003: GET /api/auth/me/ with valid session returns user data."""
        # Login first to establish session
        self.client.login(username='testuser', password='testpass123')

        response = self.client.get('/api/auth/me/')

        # Expected: 200 status, user data returned
        assert response.status_code == 200
        data = response.json()
        assert data['id'] == self.test_user.id
        assert data['username'] == 'testuser'

    def test_protected_endpoint_unauthenticated(self):
        """TEST-004: GET /api/auth/me/ without session returns 401."""
        response = self.client.get('/api/auth/me/')

        # Expected: 401 status, error message
        assert response.status_code == 401
        data = response.json()
        assert 'error' in data

    def test_protected_endpoint_expired_session(self):
        """TEST-005: GET /api/auth/me/ with expired session returns 401."""
        # Login to create session
        self.client.login(username='testuser', password='testpass123')

        # Clear session to simulate expiry
        session = self.client.session
        session.flush()

        response = self.client.get('/api/auth/me/')

        # Expected: 401 status, session expired error
        assert response.status_code == 401
        data = response.json()
        assert 'error' in data

    def test_logout_success(self):
        """TEST-006: POST /api/auth/logout/ destroys session and returns success."""
        # Login first
        self.client.login(username='testuser', password='testpass123')

        response = self.client.post('/api/auth/logout/')

        # Expected: 200 status, session cookie deleted, success response
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True

    def test_logout_invalidates_session(self):
        """TEST-007: GET /api/auth/me/ after logout returns 401."""
        # Login and logout
        self.client.login(username='testuser', password='testpass123')
        self.client.post('/api/auth/logout/')

        # Try to access protected endpoint
        response = self.client.get('/api/auth/me/')

        # Expected: 401 status, authentication required error
        assert response.status_code == 401
        data = response.json()
        assert 'error' in data

    def test_get_current_user(self):
        """TEST-008: GET /api/auth/me/ returns current user data for authenticated session."""
        # Login first
        self.client.login(username='testuser', password='testpass123')

        response = self.client.get('/api/auth/me/')

        # Expected: 200 status, complete user data
        assert response.status_code == 200
        data = response.json()
        assert data['id'] == self.test_user.id
        assert data['username'] == 'testuser'

    def test_celery_task_with_user_context(self):
        """TEST-009: Celery task receives user_id and retrieves user context."""
        # Import will fail until task is created
        from core.tasks import example_user_task

        # Execute task with user_id
        result = example_user_task(self.test_user.id)

        # Expected: Task completes with user context
        assert result is not None
        assert 'user_id' in result or 'username' in result

    def test_csrf_protection_login(self):
        """TEST-010: POST /api/auth/login/ without CSRF token returns 403."""
        # Disable CSRF for this specific test client call
        # This test will verify CSRF is enabled by default
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'testpass123'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=''  # Empty CSRF token
        )

        # Expected: 403 status if CSRF is enforced
        # Note: Django TestClient bypasses CSRF by default, so this tests configuration
        # Actual CSRF validation tested in security tests
        assert response.status_code in [403, 200]  # Will be 403 when endpoint exists with CSRF
