from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from datetime import datetime
import json

def health_check(request):
    """Basic health check endpoint for frontend connectivity testing"""
    return JsonResponse({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })


@require_http_methods(["POST"])
def auth_login(request):
    """
    GREEN-001: Login endpoint using Django session authentication.
    Accepts username/password, creates session, returns user data.
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Validate required fields
        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)

        # Authenticate user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Create session
            login(request, user)
            return JsonResponse({
                'id': user.id,
                'username': user.username
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def auth_me(request):
    """
    GREEN-003: Protected endpoint returning current user data.
    Requires valid Django session. Returns 401 if not authenticated.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username
    })


@require_http_methods(["POST"])
def auth_logout(request):
    """
    GREEN-005: Logout endpoint destroying Django session.
    Clears session and returns success response.
    """
    logout(request)
    return JsonResponse({'success': True})
