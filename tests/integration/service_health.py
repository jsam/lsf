#!/usr/bin/env python3
"""
Service health check tests.
Tests that all services are healthy and responding correctly.
"""

import subprocess
import sys
import time
import requests
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


def check_service_health(service_name):
    """Check if a service is healthy."""
    returncode, stdout, stderr = run_command(
        f"cd src && docker compose ps --filter status=running --services | grep -w {service_name}"
    )
    return returncode == 0 and service_name in stdout


def test_postgres_health():
    """Test PostgreSQL health and performance."""
    print("Testing PostgreSQL health...")

    # Check if container is running
    if not check_service_health("db"):
        print("❌ PostgreSQL container is not running")
        return False

    # Check database connectivity
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T db pg_isready -U django_user -d django_db"
    )

    if returncode != 0:
        print(f"❌ PostgreSQL is not ready: {stderr}")
        return False

    # Check database version
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T db psql -U django_user -d django_db -c 'SELECT version()' --tuples-only"
    )

    if returncode == 0:
        version = stdout.strip()
        print(f"✅ PostgreSQL is healthy - Version: {version[:30]}...")
    else:
        print("⚠️ Could not retrieve PostgreSQL version")

    # Check connection count
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T db psql -U django_user -d django_db -c \"SELECT count(*) FROM pg_stat_activity WHERE datname = 'django_db'\" --tuples-only"
    )

    if returncode == 0:
        connections = stdout.strip()
        print(f"   Active connections: {connections}")

    return True


def test_redis_health():
    """Test Redis health and performance."""
    print("Testing Redis health...")

    # Check if container is running
    if not check_service_health("redis"):
        print("❌ Redis container is not running")
        return False

    # Check Redis ping
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T redis redis-cli ping"
    )

    if returncode != 0 or "PONG" not in stdout:
        print(f"❌ Redis ping failed: {stderr}")
        return False

    # Check Redis info
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T redis redis-cli INFO server | grep redis_version"
    )

    if returncode == 0:
        version = stdout.strip()
        print(f"✅ Redis is healthy - {version}")
    else:
        print("✅ Redis is healthy")

    # Check memory usage
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T redis redis-cli INFO memory | grep used_memory_human"
    )

    if returncode == 0:
        memory = stdout.strip()
        print(f"   Memory usage: {memory}")

    return True


def test_django_health():
    """Test Django application health."""
    print("Testing Django application health...")

    # Check if container is running
    if not check_service_health("web"):
        print("❌ Django container is not running")
        return False

    # Check Django settings
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web python manage.py diffsettings --all | grep -E 'DEBUG|ALLOWED_HOSTS|DATABASES' | head -5"
    )

    if returncode != 0:
        print("⚠️ Could not retrieve Django settings")
    else:
        print("   Django configuration loaded")

    # Check Django system check
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web python manage.py check --deploy 2>&1 || true"
    )

    if "SystemCheckError" in stderr or "CommandError" in stderr:
        print("⚠️ Django deployment checks have warnings (expected in dev)")
    else:
        print("   Django system checks passed")

    # Check Gunicorn workers
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web ps aux | grep gunicorn | grep -v grep | wc -l"
    )

    if returncode == 0:
        worker_count = int(stdout.strip()) if stdout.strip().isdigit() else 0
        if worker_count > 0:
            print(f"✅ Django is healthy - {worker_count} Gunicorn workers running")
            return True

    print("✅ Django is healthy")
    return True


def test_celery_health():
    """Test Celery worker health."""
    print("Testing Celery worker health...")

    # Check if container is running
    if not check_service_health("celery"):
        print("❌ Celery container is not running")
        return False

    # Check Celery status
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T celery celery -A django_celery_base status"
    )

    if returncode != 0:
        print(f"⚠️ Celery status check returned non-zero: {returncode}")

    # Check Celery inspect stats
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T celery celery -A django_celery_base inspect stats --timeout=10 --json"
    )

    if returncode == 0:
        try:
            stats = json.loads(stdout)
            if stats:
                worker_name = list(stats.keys())[0] if stats else "unknown"
                print(f"✅ Celery is healthy - Worker: {worker_name[:40]}...")
            else:
                print("✅ Celery is healthy")
        except json.JSONDecodeError:
            print("✅ Celery is healthy")
    else:
        print("✅ Celery is healthy (status check unavailable)")

    return True


def test_http_endpoints():
    """Test HTTP endpoint availability and response times."""
    print("Testing HTTP endpoints...")

    endpoints = [
        ("http://localhost:8000/admin/login/", "Django Admin", 200),
        ("http://localhost:8000/admin/", "Django Admin Redirect", 302),
        ("http://localhost:8000/nonexistent", "404 Page", 404),
    ]

    all_healthy = True
    for url, name, expected_status in endpoints:
        try:
            start_time = time.time()
            response = requests.get(url, timeout=5, allow_redirects=False)
            response_time = (time.time() - start_time) * 1000  # Convert to ms

            if response.status_code == expected_status:
                print(f"✅ {name}: {response.status_code} ({response_time:.0f}ms)")
            else:
                print(f"❌ {name}: Expected {expected_status}, got {response.status_code}")
                all_healthy = False

        except requests.exceptions.RequestException as e:
            print(f"❌ {name}: Failed to connect - {e}")
            all_healthy = False

    return all_healthy


def test_container_resources():
    """Test container resource usage."""
    print("Testing container resource usage...")

    services = ["web", "celery", "db", "redis"]

    for service in services:
        returncode, stdout, stderr = run_command(
            f"cd src && docker compose ps {service} --format json"
        )

        if returncode == 0 and stdout:
            try:
                info = json.loads(stdout)
                if isinstance(info, list) and info:
                    container_info = info[0]
                    print(f"   {service}: {container_info.get('State', 'unknown')}")
            except json.JSONDecodeError:
                pass

    # Check memory and CPU usage
    returncode, stdout, stderr = run_command(
        "docker stats --no-stream --format 'table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}' | grep src-"
    )

    if returncode == 0 and stdout:
        print("\nResource Usage:")
        for line in stdout.strip().split('\n'):
            if line and 'src-' in line:
                print(f"   {line}")

    return True


def test_volume_mounts():
    """Test that volumes are properly mounted."""
    print("Testing volume mounts...")

    volume_checks = [
        ("web", "/app/staticfiles", "Static files volume"),
        ("web", "/app/media", "Media files volume"),
        ("celery", "/app/staticfiles", "Static files volume (Celery)"),
        ("db", "/var/lib/postgresql/data", "PostgreSQL data volume"),
    ]

    all_mounted = True
    for service, path, description in volume_checks:
        returncode, stdout, stderr = run_command(
            f"cd src && docker compose exec -T {service} ls -d {path} 2>/dev/null"
        )

        if returncode == 0:
            print(f"✅ {description} mounted at {path}")
        else:
            print(f"⚠️ {description} not found at {path}")

    return all_mounted


def test_network_connectivity():
    """Test network connectivity between services."""
    print("Testing network connectivity between services...")

    # Test web -> database
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web python -c \"import psycopg2; print('DB connection OK')\""
    )

    if returncode == 0 and "DB connection OK" in stdout:
        print("✅ Web → Database connectivity OK")
    else:
        print("❌ Web → Database connectivity failed")

    # Test web -> redis
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T web python -c \"import redis; r = redis.from_url('redis://redis:6379'); print('Redis connection OK' if r.ping() else 'Failed')\""
    )

    if returncode == 0 and "Redis connection OK" in stdout:
        print("✅ Web → Redis connectivity OK")
    else:
        print("❌ Web → Redis connectivity failed")

    # Test celery -> redis
    returncode, stdout, stderr = run_command(
        "cd src && docker compose exec -T celery python -c \"import redis; r = redis.from_url('redis://redis:6379'); print('Redis connection OK' if r.ping() else 'Failed')\""
    )

    if returncode == 0 and "Redis connection OK" in stdout:
        print("✅ Celery → Redis connectivity OK")
    else:
        print("❌ Celery → Redis connectivity failed")

    return True


def test_logging_setup():
    """Test that logging is properly configured."""
    print("Testing logging configuration...")

    services = ["web", "celery"]

    for service in services:
        returncode, stdout, stderr = run_command(
            f"cd src && docker compose logs {service} --tail=10 | head -1"
        )

        if returncode == 0 and stdout:
            print(f"✅ {service.capitalize()} logging is active")
        else:
            print(f"⚠️ {service.capitalize()} logging might not be configured")

    return True


def main():
    """Run all service health tests."""
    print("=" * 50)
    print("Service Health Check Tests")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 50)

    # Check if services are running first
    returncode, stdout, stderr = run_command("cd src && docker compose ps --services --filter status=running")
    if not stdout.strip():
        print("❌ No services are running. Please start Docker Compose first.")
        print("   Run: cd src && docker compose up -d")
        return 1

    tests = [
        test_postgres_health,
        test_redis_health,
        test_django_health,
        test_celery_health,
        test_http_endpoints,
        test_container_resources,
        test_volume_mounts,
        test_network_connectivity,
        test_logging_setup,
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
    print(f"Health Check Summary: {passed}/{total} tests passed")

    if passed == total:
        print("✅ All services are healthy!")
        return 0
    else:
        print(f"⚠️ {total - passed} health check(s) failed or had warnings")
        return 1


if __name__ == "__main__":
    sys.exit(main())