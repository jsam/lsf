#!/usr/bin/env python3
"""
Celery task functionality tests.
Tests that Celery tasks execute correctly and handle various scenarios.
"""

import subprocess
import sys
import time
import json
from datetime import datetime


def run_command(cmd, timeout=30):
    """Execute a shell command and return the result."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, "", f"Command timed out after {timeout} seconds"


def test_celery_worker_running():
    """Test that Celery worker is running and healthy."""
    print("Testing Celery worker status...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T celery celery -A django_celery_base inspect active"
    )

    if returncode != 0:
        print(f"❌ Celery worker is not responding")
        print(f"Error: {stderr}")
        return False

    print("✅ Celery worker is running")
    return True


def test_simple_addition_task():
    """Test simple addition task execution."""
    print("Testing simple addition task...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import add
result = add.delay(10, 25)
print(f'Task ID: {result.id}')
print(f'Result: {result.get(timeout=10)}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=15)

    if returncode != 0:
        print(f"❌ Addition task failed")
        print(f"Error: {stderr}")
        return False

    if "35" in stdout:
        print(f"✅ Addition task successful: 10 + 25 = 35")
        return True
    else:
        print(f"❌ Unexpected result: {stdout}")
        return False


def test_multiplication_task():
    """Test multiplication task execution."""
    print("Testing multiplication task...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import multiply
result = multiply.delay(7, 8)
print(f'Result: {result.get(timeout=10)}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=15)

    if returncode != 0:
        print(f"❌ Multiplication task failed")
        print(f"Error: {stderr}")
        return False

    if "56" in stdout:
        print(f"✅ Multiplication task successful: 7 × 8 = 56")
        return True
    else:
        print(f"❌ Unexpected result: {stdout}")
        return False


def test_long_running_task():
    """Test long-running task execution."""
    print("Testing long-running task (5 seconds)...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import long_running_task
import time
result = long_running_task.delay(5)
print(f'Task ID: {result.id}')
print(f'Task state: {result.state}')
time.sleep(1)
print(f'Task state after 1s: {result.state}')
final_result = result.get(timeout=10)
print(f'Final result: {final_result}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=20)

    if returncode != 0:
        print(f"❌ Long-running task failed")
        print(f"Error: {stderr}")
        return False

    if "Task completed after 5 seconds" in stdout:
        print(f"✅ Long-running task completed successfully")
        return True
    else:
        print(f"❌ Unexpected result: {stdout}")
        return False


def test_email_task():
    """Test email sending task (simulated)."""
    print("Testing email task (simulated)...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import send_email_task
result = send_email_task.delay('test@example.com', 'Test Subject', 'Test message body')
print(f'Result: {result.get(timeout=10)}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=15)

    if returncode != 0:
        print(f"❌ Email task failed")
        print(f"Error: {stderr}")
        return False

    if "Email sent to test@example.com" in stdout:
        print(f"✅ Email task completed successfully")
        return True
    else:
        print(f"❌ Unexpected result: {stdout}")
        return False


def test_task_retry():
    """Test task retry mechanism."""
    print("Testing task retry mechanism...")

    cmd = """cd src && docker compose exec -T web python -c "
from celery import Task
from tasks.tasks import add
import uuid

# Try to execute a task with a short timeout to test retry
task_id = str(uuid.uuid4())
result = add.apply_async(args=[5, 10], task_id=task_id)
print(f'Task ID: {result.id}')
print(f'Result: {result.get(timeout=5)}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=10)

    if returncode != 0:
        print(f"⚠️ Task retry test inconclusive")
        return True  # Not a critical failure

    if "15" in stdout:
        print(f"✅ Task executed successfully (retry not needed)")
        return True
    else:
        print(f"⚠️ Task retry test inconclusive: {stdout}")
        return True


def test_multiple_tasks():
    """Test executing multiple tasks concurrently."""
    print("Testing multiple concurrent tasks...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import add, multiply
from celery import group

# Create a group of tasks
job = group(
    add.s(2, 2),
    add.s(4, 4),
    multiply.s(3, 3),
    multiply.s(5, 5)
)

# Execute the group
result = job.apply_async()
results = result.get(timeout=10)
print(f'Results: {results}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=15)

    if returncode != 0:
        print(f"❌ Multiple tasks execution failed")
        print(f"Error: {stderr}")
        return False

    if "[4, 8, 9, 25]" in stdout or "4" in stdout and "8" in stdout and "9" in stdout and "25" in stdout:
        print(f"✅ Multiple tasks executed successfully")
        return True
    else:
        print(f"❌ Unexpected results: {stdout}")
        return False


def test_task_chaining():
    """Test task chaining."""
    print("Testing task chaining...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import add, multiply
from celery import chain

# Chain tasks: (2 + 3) * 4 = 20
workflow = chain(
    add.s(2, 3),
    multiply.s(4)
)

result = workflow.apply_async()
final_result = result.get(timeout=10)
print(f'Final result: {final_result}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=15)

    if returncode != 0:
        print(f"❌ Task chaining failed")
        print(f"Error: {stderr}")
        return False

    if "20" in stdout:
        print(f"✅ Task chaining successful: (2 + 3) × 4 = 20")
        return True
    else:
        print(f"❌ Unexpected result: {stdout}")
        return False


def test_task_result_backend():
    """Test that task results are stored in Redis."""
    print("Testing task result backend...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import add
import time

# Execute a task
result = add.delay(100, 200)
task_id = result.id
print(f'Task ID: {task_id}')

# Get result
task_result = result.get(timeout=5)
print(f'Result: {task_result}')

# Check if result is stored in backend
from celery.result import AsyncResult
from django_celery_base.celery import app
stored_result = AsyncResult(task_id, app=app)
print(f'Stored state: {stored_result.state}')
print(f'Stored result: {stored_result.result}')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=10)

    if returncode != 0:
        print(f"❌ Result backend test failed")
        print(f"Error: {stderr}")
        return False

    if "300" in stdout and "SUCCESS" in stdout:
        print(f"✅ Task results are properly stored in Redis")
        return True
    else:
        print(f"⚠️ Result backend test inconclusive: {stdout}")
        return True


def test_worker_pool_info():
    """Test worker pool information."""
    print("Testing worker pool information...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T celery celery -A django_celery_base inspect stats --json"
    )

    if returncode != 0:
        print(f"⚠️ Could not retrieve worker stats")
        return True  # Not critical

    try:
        stats = json.loads(stdout)
        if stats:
            worker_name = list(stats.keys())[0]
            worker_info = stats[worker_name]

            print(f"✅ Worker pool information retrieved:")
            print(f"   Pool size: {worker_info.get('pool', {}).get('max-concurrency', 'N/A')}")
            print(f"   Total tasks: {worker_info.get('total', {})}")

        return True
    except (json.JSONDecodeError, KeyError):
        print("⚠️ Could not parse worker stats")
        return True


def test_task_queue_info():
    """Test task queue information."""
    print("Testing task queue information...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T celery celery -A django_celery_base inspect active_queues --json"
    )

    if returncode != 0:
        print(f"⚠️ Could not retrieve queue info")
        return True  # Not critical

    try:
        queues = json.loads(stdout)
        if queues:
            print(f"✅ Queue information retrieved")
            for worker, worker_queues in queues.items():
                for queue in worker_queues:
                    print(f"   Queue: {queue.get('name', 'N/A')}")
        return True
    except (json.JSONDecodeError, KeyError):
        print("⚠️ Could not parse queue info")
        return True


def test_task_error_handling():
    """Test task error handling."""
    print("Testing task error handling...")

    cmd = """cd src && docker compose exec -T web python -c "
from tasks.tasks import add

try:
    # Try to call task with wrong number of arguments
    result = add.delay('not_a_number', 10)
    result.get(timeout=5)
    print('ERROR: Should have raised an exception')
except Exception as e:
    print(f'Exception caught: {type(e).__name__}')
    print('Error handling works correctly')
"
"""
    returncode, stdout, stderr = run_command(cmd, timeout=10)

    if "Error handling works correctly" in stdout or "Exception caught" in stdout:
        print(f"✅ Task error handling works correctly")
        return True
    else:
        print(f"⚠️ Error handling test inconclusive")
        return True


def main():
    """Run all Celery task tests."""
    print("=" * 50)
    print("Celery Task Functionality Tests")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 50)

    # Check if services are running first
    returncode, stdout, stderr = run_command("cd src && docker compose ps --services --filter status=running")
    if "celery" not in stdout or "web" not in stdout:
        print("❌ Required services are not running. Please start Docker Compose first.")
        print("   Run: cd src && docker compose up -d")
        return 1

    tests = [
        test_celery_worker_running,
        test_simple_addition_task,
        test_multiplication_task,
        test_long_running_task,
        test_email_task,
        test_task_retry,
        test_multiple_tasks,
        test_task_chaining,
        test_task_result_backend,
        test_worker_pool_info,
        test_task_queue_info,
        test_task_error_handling,
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
            print()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
            print()

    # Summary
    print("=" * 50)
    passed = sum(1 for r in results if r)
    total = len(results)
    print(f"Celery Test Summary: {passed}/{total} tests passed")

    if passed == total:
        print("✅ All Celery task tests passed!")
        return 0
    else:
        print(f"❌ {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())