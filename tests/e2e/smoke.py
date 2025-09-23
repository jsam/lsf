#!/usr/bin/env python3
"""
System smoke tests for deployment validation.
Validates complete system is operational with minimal checks.
"""

import subprocess
import sys
import time
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


def test_system_operational():
    """Test that complete system is operational."""
    print("Testing system operational status...")

    # Check all services running
    returncode, stdout, stderr = run_command("cd src && docker compose ps --services --filter status=running")
    if not stdout.strip():
        print("❌ System not operational - no services running")
        return False

    services = stdout.strip().split('\n')
    expected_services = {'web', 'db', 'redis', 'celery', 'frontend'}
    running_services = set(services)

    if not expected_services.issubset(running_services):
        missing = expected_services - running_services
        print(f"❌ System not operational - missing services: {missing}")
        return False

    print("✅ System operational - all services running")
    return True


def test_api_responding():
    """Test that API is responding to requests."""
    print("Testing API response...")

    returncode, stdout, stderr = run_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/health/")

    if "200" not in stdout:
        print(f"❌ API not responding correctly: {stdout}")
        return False

    print("✅ API responding correctly")
    return True


def test_frontend_accessible():
    """Test that frontend is accessible."""
    print("Testing frontend accessibility...")

    returncode, stdout, stderr = run_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:80/")

    if "200" not in stdout:
        print(f"❌ Frontend not accessible: {stdout}")
        return False

    print("✅ Frontend accessible")
    return True


def main():
    """Run system smoke tests."""
    print("=" * 50)
    print("System Smoke Tests")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 50)

    tests = [
        test_system_operational,
        test_api_responding,
        test_frontend_accessible
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
    print(f"Smoke Test Summary: {passed}/{total} tests passed")

    if passed == total:
        print("✅ System smoke tests passed!")
        return 0
    else:
        print("❌ System smoke tests failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())