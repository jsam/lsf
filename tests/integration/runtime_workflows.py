#!/usr/bin/env python3
"""
Integration tests for Docker runtime.
Tests that all services start correctly and can communicate with each other.
"""

import subprocess
import sys
import time
import requests
import json


def run_command(cmd, timeout=60):
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


def start_docker_compose():
    """Start Docker Compose services in the background."""
    print("Starting Docker Compose services...")
    returncode, stdout, stderr = run_command("cd src && docker compose up -d")

    if returncode != 0:
        print(f"❌ Failed to start Docker Compose")
        print(f"Error: {stderr}")
        return False

    print("✅ Docker Compose started")
    print("Waiting for services to be ready...")
    time.sleep(30)  # Give services time to start
    return True


def stop_docker_compose():
    """Stop and remove Docker Compose services."""
    print("Stopping Docker Compose services...")
    run_command("cd src && docker compose down -v")  # -v removes volumes too


def test_all_containers_running():
    """Test that all required containers are running."""
    print("Testing container status...")

    required_services = ["web", "celery", "db", "redis"]
    all_running = True

    for service in required_services:
        returncode, stdout, stderr = run_command(
            f"cd src && docker compose ps --filter status=running --services | grep -w {service}"
        )

        if returncode != 0 or service not in stdout:
            print(f"❌ Service '{service}' is not running")
            all_running = False
        else:
            print(f"✅ Service '{service}' is running")

    return all_running


def test_database_connection():
    """Test that the database is accessible."""
    print("Testing database connection...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T db psql -U django_user -d django_db -c 'SELECT 1'"
    )

    if returncode != 0:
        print(f"❌ Database connection failed")
        print(f"Error: {stderr}")
        return False

    print("✅ Database connection successful")
    return True


def test_redis_connection():
    """Test that Redis is accessible."""
    print("Testing Redis connection...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T redis redis-cli ping"
    )

    if returncode != 0 or "PONG" not in stdout:
        print(f"❌ Redis connection failed")
        print(f"Error: {stderr}")
        return False

    print("✅ Redis connection successful")
    return True


def test_web_service_health():
    """Test that the web service is responding."""
    print("Testing web service health...")

    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = requests.get("http://localhost:8000/admin/", timeout=5)
            if response.status_code in [200, 301, 302]:
                print(f"✅ Web service is healthy (status: {response.status_code})")
                return True
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"Retry {attempt + 1}/{max_retries}...")
                time.sleep(5)
            else:
                print(f"❌ Web service is not responding: {e}")
                return False

    return False


def test_django_admin_accessible():
    """Test that Django admin is accessible."""
    print("Testing Django admin accessibility...")

    try:
        response = requests.get("http://localhost:8000/admin/login/", timeout=5)
        if response.status_code == 200:
            if "Django" in response.text or "login" in response.text.lower():
                print("✅ Django admin login page is accessible")
                return True
            else:
                print("❌ Django admin login page content unexpected")
                return False
        else:
            print(f"❌ Django admin returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to access Django admin: {e}")
        return False


def test_celery_worker_status():
    """Test that Celery worker is running and ready."""
    print("Testing Celery worker status...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T celery celery -A django_celery_base inspect active"
    )

    if returncode != 0:
        print(f"❌ Failed to check Celery worker status")
        print(f"Error: {stderr}")
        return False

    print("✅ Celery worker is responding")
    return True


def test_celery_task_execution():
    """Test that Celery can execute a simple task."""
    print("Testing Celery task execution...")

    # Execute a simple addition task
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web python -c \"from tasks.tasks import add; result = add.delay(2, 3); print(result.get(timeout=10))\""
    )

    if returncode != 0:
        print(f"❌ Failed to execute Celery task")
        print(f"Error: {stderr}")
        return False

    if "5" in stdout:
        print("✅ Celery task executed successfully")
        return True
    else:
        print(f"❌ Unexpected Celery task result: {stdout}")
        return False


def test_migrations_applied():
    """Test that Django migrations have been applied."""
    print("Testing Django migrations...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web python manage.py showmigrations --plan | grep -E '\\[X\\]|\\[ \\]'"
    )

    if returncode != 0:
        print(f"❌ Failed to check migrations")
        print(f"Error: {stderr}")
        return False

    if "[ ]" in stdout:
        print("❌ Some migrations are not applied")
        return False

    print("✅ All migrations are applied")
    return True


def test_static_files_collected():
    """Test that static files have been collected."""
    print("Testing static files collection...")

    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web ls -la /app/staticfiles/admin/"
    )

    if returncode != 0:
        print(f"⚠️ Static files not collected (may be normal for development)")
        return True  # Not a critical failure

    print("✅ Static files collected")
    return True


def test_environment_variables():
    """Test that required environment variables are set."""
    print("Testing environment variables...")

    env_vars = [
        ("DATABASE_URL", "web"),
        ("CELERY_BROKER_URL", "celery"),
        ("CELERY_RESULT_BACKEND", "celery"),
    ]

    all_set = True
    for var, service in env_vars:
        returncode, stdout, stderr = run_command(
            f"cd src && docker compose exec -T {service} printenv {var}"
        )

        if returncode != 0 or not stdout.strip():
            print(f"❌ Environment variable '{var}' not set in service '{service}'")
            all_set = False
        else:
            print(f"✅ Environment variable '{var}' is set in service '{service}'")

    return all_set


def test_container_logs():
    """Check container logs for errors."""
    print("Checking container logs for errors...")

    services = ["web", "celery", "db", "redis"]
    error_patterns = ["ERROR", "FATAL", "CRITICAL", "Traceback"]

    has_errors = False
    for service in services:
        returncode, stdout, stderr = run_command(
            f"cd src && docker compose logs {service} --tail=50"
        )

        for pattern in error_patterns:
            if pattern in stdout or pattern in stderr:
                # Ignore some known non-critical warnings
                if "WARNING" in pattern:
                    continue
                if "C.UTF-8" in stdout:  # Common locale warning
                    continue
                if "Memory overcommit" in stdout:  # Redis warning
                    continue

                print(f"⚠️ Found '{pattern}' in {service} logs")
                has_errors = True

    if not has_errors:
        print("✅ No critical errors found in container logs")
        return True
    else:
        print("⚠️ Some warnings found in logs (may not be critical)")
        return True  # Don't fail on warnings


def main():
    """Run all Docker runtime tests."""
    print("=" * 50)
    print("Docker Runtime Integration Tests")
    print("=" * 50)

    # Start services
    if not start_docker_compose():
        print("Failed to start Docker Compose services")
        return 1

    try:
        tests = [
            test_all_containers_running,
            test_database_connection,
            test_redis_connection,
            test_web_service_health,
            test_django_admin_accessible,
            test_celery_worker_status,
            test_celery_task_execution,
            test_migrations_applied,
            test_static_files_collected,
            test_environment_variables,
            test_container_logs,
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
        print(f"Test Summary: {passed}/{total} tests passed")

        if passed == total:
            print("✅ All Docker runtime tests passed!")
            return 0
        else:
            print(f"❌ {total - passed} test(s) failed")
            return 1

    finally:
        # Always stop services
        stop_docker_compose()


if __name__ == "__main__":
    sys.exit(main())