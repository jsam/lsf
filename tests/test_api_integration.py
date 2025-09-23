#!/usr/bin/env python3

import subprocess
import json
import sys
import time

def run_command(command):
    """Execute shell command and return output"""
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def test_health_endpoint_direct():
    """Test Django health endpoint directly"""
    print("Testing Django health endpoint...")

    returncode, stdout, stderr = run_command("curl -s http://localhost:8000/api/health/")

    if returncode != 0:
        print(f"❌ Django health endpoint failed: {stderr}")
        return False

    try:
        response = json.loads(stdout)
        if response.get("status") != "ok":
            print(f"❌ Health endpoint returned wrong status: {response}")
            return False
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON response: {stdout}")
        return False

    print("✅ Django health endpoint working")
    return True

def test_health_endpoint_via_proxy():
    """Test health endpoint through frontend proxy"""
    print("Testing API proxy routing...")

    returncode, stdout, stderr = run_command("curl -s http://localhost:80/api/health/")

    if returncode != 0:
        print(f"❌ API proxy failed: {stderr}")
        return False

    try:
        response = json.loads(stdout)
        if response.get("status") != "ok":
            print(f"❌ Proxy returned wrong response: {response}")
            return False
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON from proxy: {stdout}")
        return False

    print("✅ API proxy routing working")
    return True

def test_cors_headers():
    """Test CORS headers are present"""
    print("Testing CORS headers...")

    returncode, stdout, stderr = run_command(
        "curl -s -H 'Origin: http://localhost:80' -I http://localhost:8000/api/health/"
    )

    if returncode != 0:
        print(f"❌ CORS test failed: {stderr}")
        return False

    if "access-control-allow-origin" not in stdout.lower():
        print(f"❌ CORS headers missing: {stdout}")
        return False

    print("✅ CORS headers present")
    return True

def test_frontend_serving():
    """Test frontend is serving React app"""
    print("Testing frontend serving...")

    returncode, stdout, stderr = run_command("curl -s http://localhost:80/")

    if returncode != 0:
        print(f"❌ Frontend not accessible: {stderr}")
        return False

    if "Django Celery Frontend" not in stdout or "root" not in stdout:
        print(f"❌ Frontend not serving React app: {stdout[:100]}...")
        return False

    print("✅ Frontend serving React app")
    return True

def test_api_error_handling():
    """Test API error handling"""
    print("Testing API error handling...")

    returncode, stdout, stderr = run_command("curl -s -w '%{http_code}' http://localhost:8000/api/nonexistent/")

    if "404" not in stdout:
        print(f"❌ API error handling failed: {stdout}")
        return False

    print("✅ API error handling working")
    return True

def test_proxy_error_handling():
    """Test proxy error handling"""
    print("Testing proxy error handling...")

    returncode, stdout, stderr = run_command("curl -s -w '%{http_code}' http://localhost:80/api/nonexistent/")

    if "404" not in stdout:
        print(f"❌ Proxy error handling failed: {stdout}")
        return False

    print("✅ Proxy error handling working")
    return True

def test_response_times():
    """Test API response times are reasonable"""
    print("Testing API response times...")

    returncode, stdout, stderr = run_command(
        "curl -s -w '%{time_total}' -o /dev/null http://localhost:8000/api/health/"
    )

    if returncode != 0:
        print(f"❌ Response time test failed: {stderr}")
        return False

    try:
        response_time = float(stdout)
        if response_time > 1.0:  # 1 second threshold
            print(f"❌ Response time too slow: {response_time}s")
            return False
    except ValueError:
        print(f"❌ Invalid response time: {stdout}")
        return False

    print(f"✅ Response time acceptable: {response_time}s")
    return True

def main():
    """Run all API integration tests"""
    print("=" * 50)
    print("API Integration Tests")
    print("Timestamp:", time.strftime("%Y-%m-%dT%H:%M:%S"))
    print("=" * 50)

    tests = [
        test_health_endpoint_direct,
        test_health_endpoint_via_proxy,
        test_cors_headers,
        test_frontend_serving,
        test_api_error_handling,
        test_proxy_error_handling,
        test_response_times
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        else:
            print()

    print("=" * 50)
    print(f"API Integration Summary: {passed}/{total} tests passed")

    if passed == total:
        print("✅ All API integration tests passed!")
        return 0
    else:
        print("❌ Some API integration tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())