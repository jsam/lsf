from django.http import JsonResponse
from datetime import datetime

def health_check(request):
    """Basic health check endpoint for frontend connectivity testing"""
    return JsonResponse({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })
