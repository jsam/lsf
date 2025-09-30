"""
Authentication API contract tests.
Validates endpoint schemas and API contracts.
"""
import pytest
from django.test import TestCase, Client
from django.contrib.auth.models import User


class AuthAPIContractTests(TestCase):
    """Contract tests for authentication API endpoints."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = Client()
        self.test_user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_login_contract(self):
        """
        TEST-201: Validate /api/auth/login/ endpoint contract.
        Method: POST
        Payload: {"username": "string", "password": "string"}
        Response: 200, {"id": number, "username": "string"}, Set-Cookie: sessionid
        """
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'testpass123'},
            content_type='application/json'
        )

        # Validate response structure
        assert response.status_code == 200
        data = response.json()

        # Validate response schema
        assert 'id' in data
        assert isinstance(data['id'], int)
        assert 'username' in data
        assert isinstance(data['username'], str)
        assert data['username'] == 'testuser'

        # Validate session cookie
        assert 'sessionid' in response.cookies
        assert response.cookies['sessionid'].value != ''

    def test_logout_contract(self):
        """
        TEST-202: Validate /api/auth/logout/ endpoint contract.
        Method: POST
        Payload: None (session cookie required)
        Response: 200, {"success": true}, Set-Cookie: sessionid="" (delete)
        """
        # Login first to establish session
        self.client.login(username='testuser', password='testpass123')

        response = self.client.post('/api/auth/logout/')

        # Validate response structure
        assert response.status_code == 200
        data = response.json()

        # Validate response schema
        assert 'success' in data
        assert isinstance(data['success'], bool)
        assert data['success'] is True

    def test_me_contract(self):
        """
        TEST-203: Validate /api/auth/me/ endpoint contract.
        Method: GET
        Payload: None (session cookie required)
        Response: 200, {"id": number, "username": "string"}
        """
        # Login first to establish session
        self.client.login(username='testuser', password='testpass123')

        response = self.client.get('/api/auth/me/')

        # Validate response structure
        assert response.status_code == 200
        data = response.json()

        # Validate response schema
        assert 'id' in data
        assert isinstance(data['id'], int)
        assert 'username' in data
        assert isinstance(data['username'], str)
        assert data['id'] == self.test_user.id
        assert data['username'] == 'testuser'
