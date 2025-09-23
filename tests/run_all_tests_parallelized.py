#!/usr/bin/env python3
"""
Parallelized test runner for agentic TDD test suite.
Executes tests in parallel groups based on dependencies and resource isolation.
"""

import subprocess
import sys
import time
import concurrent.futures
import argparse
from pathlib import Path
from datetime import datetime


class TestRunner:
    def __init__(self):
        self.results = {}
        self.start_time = time.time()

    def run_command(self, cmd, timeout=300):
        """Execute shell command and return result."""
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=timeout
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return 1, "", f"Command timed out after {timeout} seconds"

    def run_test(self, test_name, test_path):
        """Execute single test and return result."""
        print(f"Starting: {test_name}")

        if not Path(test_path).exists():
            return test_name, False, f"Test file not found: {test_path}"

        returncode, stdout, stderr = self.run_command(f"python3 {test_path}")

        success = returncode == 0
        output = stdout if success else stderr

        print(f"{'✅' if success else '❌'} {test_name}: {'PASSED' if success else 'FAILED'}")
        return test_name, success, output

    def run_react_tests(self):
        """Execute React unit tests."""
        print("Starting: React Unit Tests")

        if not Path("src/frontend").exists():
            return "React Unit Tests", False, "Frontend directory not found"

        # Change to frontend directory and run tests
        returncode, stdout, stderr = self.run_command("cd src/frontend && npm test")

        success = returncode == 0
        output = stdout if success else stderr

        print(f"{'✅' if success else '❌'} React Unit Tests: {'PASSED' if success else 'FAILED'}")
        return "React Unit Tests", success, output

    def run_build_tests_parallel(self):
        """Run build tests in parallel (no dependencies)."""
        build_tests = [
            ("Docker Build", "tests/integration/build_workflows.py"),
            ("Frontend Build", "tests/integration/frontend_workflows.py")
        ]

        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            futures = [
                executor.submit(self.run_test, name, path)
                for name, path in build_tests
            ]

            # Also run React tests in parallel
            react_future = executor.submit(self.run_react_tests)
            futures.append(react_future)

            results = [future.result() for future in concurrent.futures.as_completed(futures)]

        return results

    def run_runtime_tests_parallel(self):
        """Run runtime tests in parallel (assumes services running)."""
        runtime_tests = [
            ("Service Health", "tests/integration/service_health.py"),
            ("API Workflows", "tests/integration/api_workflows.py"),
            ("Task Workflows", "tests/integration/task_workflows.py"),
            ("Runtime Workflows", "tests/integration/runtime_workflows.py"),
            ("System Smoke", "tests/e2e/smoke.py")
        ]

        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(self.run_test, name, path)
                for name, path in runtime_tests
            ]

            results = [future.result() for future in concurrent.futures.as_completed(futures)]

        return results

    def check_services_running(self):
        """Check if Docker services are running."""
        returncode, stdout, stderr = self.run_command(
            "cd src && docker compose ps --services --filter status=running"
        )
        return returncode == 0 and stdout.strip()

    def cleanup_docker(self):
        """Clean up Docker containers."""
        print("Cleaning up Docker environment...")
        containers = subprocess.run(
            "docker ps -aq", shell=True, capture_output=True, text=True
        )
        if containers.stdout.strip():
            subprocess.run(
                f"docker rm -f {containers.stdout.strip()}",
                shell=True, capture_output=True
            )

    def start_services(self):
        """Start Docker services for runtime tests."""
        print("Starting Docker services...")
        returncode, stdout, stderr = self.run_command("cd src && docker compose up -d")
        if returncode != 0:
            print(f"Failed to start services: {stderr}")
            return False

        print("Waiting for services to be ready...")
        time.sleep(30)
        return True

    def stop_services(self):
        """Stop Docker services."""
        print("Stopping Docker services...")
        self.run_command("cd src && docker compose down")

    def print_summary(self, all_results):
        """Print test execution summary."""
        total_time = time.time() - self.start_time

        print("\n" + "=" * 50)
        print("PARALLELIZED TEST SUITE SUMMARY")
        print(f"Execution time: {total_time:.2f} seconds")
        print("=" * 50)

        passed = 0
        failed = 0

        for test_name, success, output in all_results:
            if success:
                passed += 1
                print(f"✅ {test_name}")
            else:
                failed += 1
                print(f"❌ {test_name}")
                # Print first line of error for quick diagnosis
                if output:
                    error_line = output.split('\n')[0][:80]
                    print(f"   Error: {error_line}")

        total = passed + failed
        print(f"\nResults: {passed}/{total} tests passed")

        if failed == 0:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {failed} test(s) failed")
            return 1


def main():
    parser = argparse.ArgumentParser(description="Parallelized test runner")
    parser.add_argument("--build-only", action="store_true", help="Run only build tests")
    parser.add_argument("--runtime-only", action="store_true", help="Run only runtime tests")
    parser.add_argument("--keep-running", action="store_true", help="Keep services running")
    args = parser.parse_args()

    runner = TestRunner()

    print("=" * 50)
    print("PARALLELIZED TEST SUITE")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 50)

    # Check project structure
    if not Path("src/docker-compose.yml").exists():
        print("❌ src/docker-compose.yml not found. Run from lsf directory.")
        return 1

    all_results = []

    # Clean up Docker environment first
    if not args.runtime_only:
        runner.cleanup_docker()

    # Run build tests
    if not args.runtime_only:
        print("\n🔨 Running build tests in parallel...")
        build_results = runner.run_build_tests_parallel()
        all_results.extend(build_results)

    # Run runtime tests
    if not args.build_only:
        services_were_running = runner.check_services_running()

        if not services_were_running:
            if not runner.start_services():
                print("❌ Failed to start services for runtime tests")
                return 1
        else:
            print("Docker services already running, using existing services")

        print("\n🚀 Running runtime tests in parallel...")
        runtime_results = runner.run_runtime_tests_parallel()
        all_results.extend(runtime_results)

        # Cleanup services if we started them
        if not args.keep_running and not services_were_running:
            runner.stop_services()

    return runner.print_summary(all_results)


if __name__ == "__main__":
    sys.exit(main())