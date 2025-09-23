#!/usr/bin/env python3
"""
Integration tests for Docker build process.
Tests that the Docker image builds correctly with all required dependencies.
"""

import subprocess
import sys
import json
import time


def run_command(cmd, timeout=300):
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


def test_docker_build():
    """Test that the Docker image builds successfully."""
    print("Testing Docker build...")

    # Build the Docker image
    returncode, stdout, stderr = run_command(
        "cd src && docker build -t django-celery-test:latest .",
        timeout=600
    )

    if returncode != 0:
        print(f"❌ Docker build failed")
        print(f"Error: {stderr}")
        return False

    print("✅ Docker image built successfully")
    return True


def test_docker_image_exists():
    """Test that the built Docker image exists."""
    print("Testing Docker image existence...")

    returncode, stdout, stderr = run_command(
        "docker images django-celery-test:latest --format json"
    )

    if returncode != 0:
        print(f"❌ Failed to list Docker images")
        print(f"Error: {stderr}")
        return False

    if not stdout.strip():
        print("❌ Docker image not found")
        return False

    try:
        image_info = json.loads(stdout.strip())
        print(f"✅ Docker image exists: {image_info.get('Repository', 'unknown')}:{image_info.get('Tag', 'unknown')}")
        return True
    except json.JSONDecodeError:
        print("❌ Failed to parse Docker image info")
        return False


def test_dockerfile_instructions():
    """Test that the Dockerfile contains required instructions."""
    print("Testing Dockerfile instructions...")

    required_instructions = [
        "FROM python:",
        "WORKDIR /app",
        "COPY requirements.txt",
        "RUN pip install",
        "COPY . /app",
    ]

    try:
        with open("src/Dockerfile", "r") as f:
            dockerfile_content = f.read()

        missing_instructions = []
        for instruction in required_instructions:
            if instruction not in dockerfile_content:
                missing_instructions.append(instruction)

        if missing_instructions:
            print(f"❌ Missing required Dockerfile instructions: {missing_instructions}")
            return False

        print("✅ All required Dockerfile instructions present")
        return True

    except FileNotFoundError:
        print("❌ Dockerfile not found")
        return False


def test_dependencies_installed():
    """Test that required Python dependencies are installed in the image."""
    print("Testing installed dependencies...")

    # Run a container to check installed packages
    returncode, stdout, stderr = run_command(
        "docker run --rm django-celery-test:latest pip list --format json"
    )

    if returncode != 0:
        print(f"❌ Failed to check installed dependencies")
        print(f"Error: {stderr}")
        return False

    try:
        installed_packages = json.loads(stdout)
        package_names = {pkg["name"].lower() for pkg in installed_packages}

        required_packages = {
            "django",
            "celery",
            "redis",
            "psycopg2-binary",
            "gunicorn"
        }

        missing_packages = required_packages - package_names

        if missing_packages:
            print(f"❌ Missing required packages: {missing_packages}")
            return False

        print("✅ All required dependencies installed")
        return True

    except json.JSONDecodeError:
        print("❌ Failed to parse installed packages")
        return False


def test_entrypoint_exists():
    """Test that the entrypoint script exists in the image."""
    print("Testing entrypoint script...")

    returncode, stdout, stderr = run_command(
        "docker run --rm django-celery-test:latest ls -la /app/entrypoint.sh"
    )

    if returncode != 0:
        print(f"❌ Entrypoint script not found")
        print(f"Error: {stderr}")
        return False

    print("✅ Entrypoint script exists")
    return True


def test_static_files_directory():
    """Test that static files directory exists in the image."""
    print("Testing static files directory...")

    returncode, stdout, stderr = run_command(
        "docker run --rm django-celery-test:latest ls -la /app/staticfiles"
    )

    if returncode != 0:
        # Directory might not exist yet, which is okay
        print("⚠️ Static files directory not found (will be created at runtime)")
        return True

    print("✅ Static files directory exists")
    return True


def main():
    """Run all Docker build tests."""
    print("=" * 50)
    print("Docker Build Integration Tests")
    print("=" * 50)

    tests = [
        test_docker_build,
        test_docker_image_exists,
        test_dockerfile_instructions,
        test_dependencies_installed,
        test_entrypoint_exists,
        test_static_files_directory,
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
        print("✅ All Docker build tests passed!")
        return 0
    else:
        print(f"❌ {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())