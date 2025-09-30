"""
Celery tasks for core application.
GREEN-008: Example task with user context.
"""
from celery import shared_task
from django.contrib.auth.models import User


@shared_task
def example_user_task(user_id):
    """
    Example Celery task that accepts user_id parameter.
    Demonstrates how to pass user context from authenticated views to background tasks.
    """
    try:
        user = User.objects.get(id=user_id)
        return {
            'success': True,
            'user_id': user.id,
            'username': user.username
        }
    except User.DoesNotExist:
        return {
            'success': False,
            'error': f'User with id {user_id} not found'
        }
