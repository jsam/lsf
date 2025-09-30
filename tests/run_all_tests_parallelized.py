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
import json
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

    def run_pytest(self):
        """Execute Python unit tests with pytest."""
        print("Starting: Python Unit Tests")

        unit_dir = Path("tests/unit")
        if not unit_dir.exists():
            return "Python Unit Tests", True, "No unit tests directory found (OK for Phase 1)"

        # Check if there are any test files
        test_files = list(unit_dir.glob("test_*.py"))
        if not test_files:
            print("✅ Python Unit Tests: PASSED")
            return "Python Unit Tests", True, "No unit test files found (OK for Phase 1)"

        returncode, stdout, stderr = self.run_command("pytest tests/unit/ -v --tb=short")

        success = returncode == 0
        output = stdout if success else stderr

        print(f"{'✅' if success else '❌'} Python Unit Tests: {'PASSED' if success else 'FAILED'}")
        return "Python Unit Tests", success, output

    def run_build_tests_parallel(self):
        """Run build tests in parallel (no dependencies)."""
        build_tests = [
            ("Docker Build", "tests/integration/build_workflows.py"),
            ("Frontend Build", "tests/integration/frontend_workflows.py")
        ]

        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(self.run_test, name, path)
                for name, path in build_tests
            ]

            # Also run React and Python unit tests in parallel
            react_future = executor.submit(self.run_react_tests)
            pytest_future = executor.submit(self.run_pytest)
            futures.extend([react_future, pytest_future])

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

    def load_test_registry(self):
        """Load test registry from JSON file."""
        registry_path = Path("tests/test-registry.json")
        if not registry_path.exists():
            # Create default registry if it doesn't exist
            default_registry = {
                "baseline": {
                    "backend_integration": [],
                    "backend_unit": [],
                    "frontend_e2e": [],
                    "frontend_unit": []
                },
                "new": {
                    "backend_integration": [],
                    "backend_unit": [],
                    "frontend_e2e": [],
                    "frontend_unit": []
                }
            }
            registry_path.write_text(json.dumps(default_registry, indent=2))
            return default_registry

        return json.loads(registry_path.read_text())

    def _check_frontend_running(self):
        """Check if frontend dev server is accessible."""
        try:
            result = subprocess.run(
                "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000",
                shell=True,
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.stdout.strip() == "200"
        except:
            return False

    def run_frontend_e2e_tests(self):
        """Execute frontend E2E tests with Playwright."""
        print("Starting: Frontend E2E Tests")

        e2e_dir = Path("tests/e2e/frontend")
        if not e2e_dir.exists():
            return "Frontend E2E Tests", True, "No E2E tests directory (OK for Phase 1)"

        # Check for test files
        test_files = list(e2e_dir.glob("*.spec.js")) + list(e2e_dir.glob("*.spec.ts"))
        if not test_files:
            return "Frontend E2E Tests", True, "No E2E test files (OK)"

        # Ensure backend services running (E2E needs API)
        if not self.check_services_running():
            print("Backend services not running, starting...")
            if not self.start_services():
                return "Frontend E2E Tests", False, "Failed to start backend services"

        # Check if frontend dev server is running
        frontend_running = self._check_frontend_running()
        if not frontend_running:
            return "Frontend E2E Tests", False, "Frontend dev server not running. Start with: cd src/frontend && npm run dev"

        # Run Playwright tests
        returncode, stdout, stderr = self.run_command(
            "cd tests/e2e/frontend && npx playwright test --reporter=json",
            timeout=600  # E2E tests can be slower
        )

        success = returncode == 0
        output = stdout if success else stderr

        print(f"{'✅' if success else '❌'} Frontend E2E Tests: {'PASSED' if success else 'FAILED'}")
        return "Frontend E2E Tests", success, output

    def run_frontend_unit_tests(self):
        """Execute frontend unit tests with Vitest (utils only)."""
        print("Starting: Frontend Unit Tests")

        unit_dir = Path("src/frontend/tests/unit")
        if not unit_dir.exists():
            return "Frontend Unit Tests", True, "No frontend unit tests (OK)"

        # These are fast, no Docker needed
        returncode, stdout, stderr = self.run_command(
            "cd src/frontend && npm run test:unit -- --reporter=json",
            timeout=60
        )

        success = returncode == 0
        output = stdout if success else stderr

        print(f"{'✅' if success else '❌'} Frontend Unit Tests: {'PASSED' if success else 'FAILED'}")
        return "Frontend Unit Tests", success, output

    def run_backend_integration_tests(self, test_paths):
        """Run backend integration tests from registry."""
        if not test_paths:
            return []

        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(self.run_test, Path(path).stem, path)
                for path in test_paths
            ]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]

        return results

    def run_registry_based_tests(self, mode="all"):
        """
        Run tests based on registry.

        mode: "all", "baseline-only", "new-only"
        """
        registry = self.load_test_registry()

        if mode == "baseline-only":
            test_sets = registry["baseline"]
        elif mode == "new-only":
            test_sets = registry["new"]
        else:  # "all"
            test_sets = {
                category: registry["baseline"][category] + registry["new"][category]
                for category in registry["baseline"].keys()
            }

        all_results = []

        # Run backend integration tests
        if test_sets.get("backend_integration"):
            results = self.run_backend_integration_tests(test_sets["backend_integration"])
            all_results.extend(results)

        # Run backend unit tests
        if test_sets.get("backend_unit"):
            # Run pytest on specific files
            for test_path in test_sets["backend_unit"]:
                result = self.run_test(Path(test_path).stem, test_path)
                all_results.append(result)

        # Run frontend E2E tests
        if test_sets.get("frontend_e2e"):
            # Playwright runs all specs in directory
            # For now, run all or none (can't easily filter specific files)
            if test_sets["frontend_e2e"]:
                result = self.run_frontend_e2e_tests()
                all_results.append(result)

        # Run frontend unit tests
        if test_sets.get("frontend_unit"):
            # Vitest can run specific files
            for test_path in test_sets["frontend_unit"]:
                returncode, stdout, stderr = self.run_command(
                    f"cd src/frontend && npm run test:unit -- {test_path}"
                )
                success = returncode == 0
                all_results.append((Path(test_path).stem, success, stdout if success else stderr))

        return all_results

    def output_json(self, all_results):
        """Output results in JSON format for agent parsing."""
        passed = 0
        failed = 0
        test_details = []

        for test_name, success, output in all_results:
            if success:
                passed += 1
            else:
                failed += 1

            test_details.append({
                "name": test_name,
                "passed": success,
                "output": output[:200] if output else ""  # Truncate output
            })

        result = {
            "total": passed + failed,
            "passed": passed,
            "failed": failed,
            "tests": test_details
        }

        return json.dumps(result, indent=2)

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

    # NEW: Registry-based execution
    parser.add_argument("--baseline-only", action="store_true", help="Run only baseline tests from registry")
    parser.add_argument("--new-only", action="store_true", help="Run only newly added tests from registry")
    parser.add_argument("--category", choices=["backend_integration", "backend_unit", "frontend_e2e", "frontend_unit"],
                       help="Run only tests from specific category")
    parser.add_argument("--json-output", action="store_true", help="Output results in JSON format for agent parsing")

    args = parser.parse_args()

    runner = TestRunner()

    # Registry-based execution (NEW)
    if args.baseline_only or args.new_only:
        mode = "baseline-only" if args.baseline_only else "new-only"

        if not args.json_output:
            print("=" * 50)
            print(f"REGISTRY-BASED TEST SUITE ({mode.upper()})")
            print(f"Started: {datetime.now().isoformat()}")
            print("=" * 50)

        all_results = runner.run_registry_based_tests(mode=mode)

        if args.json_output:
            print(runner.output_json(all_results))
            return 0 if all([r[1] for r in all_results]) else 1
        else:
            return runner.print_summary(all_results)

    # Original execution (for backward compatibility)
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