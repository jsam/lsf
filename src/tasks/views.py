from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .tasks import add, multiply, long_running_task, send_email_task


def trigger_add_task(request):
    """Trigger addition task."""
    x = int(request.GET.get('x', 5))
    y = int(request.GET.get('y', 10))

    result = add.delay(x, y)

    return JsonResponse({
        'task_id': result.id,
        'message': f'Addition task started with {x} + {y}',
        'status': 'PENDING'
    })


def trigger_multiply_task(request):
    """Trigger multiplication task."""
    x = int(request.GET.get('x', 5))
    y = int(request.GET.get('y', 10))

    result = multiply.delay(x, y)

    return JsonResponse({
        'task_id': result.id,
        'message': f'Multiplication task started with {x} * {y}',
        'status': 'PENDING'
    })


def trigger_long_task(request):
    """Trigger long running task."""
    duration = int(request.GET.get('duration', 10))

    result = long_running_task.delay(duration)

    return JsonResponse({
        'task_id': result.id,
        'message': f'Long running task started for {duration} seconds',
        'status': 'PENDING'
    })


@csrf_exempt
def trigger_email_task(request):
    """Trigger email sending task."""
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email', 'test@example.com')
        subject = data.get('subject', 'Test Subject')
        message = data.get('message', 'Test message')

        result = send_email_task.delay(email, subject, message)

        return JsonResponse({
            'task_id': result.id,
            'message': f'Email task started for {email}',
            'status': 'PENDING'
        })

    return JsonResponse({'error': 'Only POST method allowed'}, status=405)


def get_task_status(request, task_id):
    """Get task status by ID."""
    from celery.result import AsyncResult

    result = AsyncResult(task_id)

    return JsonResponse({
        'task_id': task_id,
        'status': result.status,
        'result': result.result if result.ready() else None,
        'ready': result.ready()
    })
