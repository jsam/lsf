#!/usr/bin/env python
"""
Test script for the Django-Celery API endpoints.

This script tests all the API endpoints of the Django-Celery application:
1. Addition task
2. Multiplication task
3. Long running task
4. Email task
5. Task status check

The script sends requests to each endpoint and verifies that the response
is correct and that the tasks are executed successfully.
"""

import requests
import json
import time
import argparse
from typing import Dict, Any
import sys


class APITester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        Initialize the API tester.

        Args:
            base_url: Base URL of the Django application
        """
        self.base_url = base_url
        self.tasks_url = f"{base_url}/tasks"
        self.task_ids = []
        self.results = {
            "success": 0,
            "failure": 0,
            "tests": []
        }

    def _log_result(self, test_name: str, status: bool, message: str, response: Dict[str, Any] = None) -> None:
        """
        Log the result of a test.

        Args:
            test_name: Name of the test
            status: True if the test passed, False otherwise
            message: Message to log
            response: Response from the API
        """
        result = {
            "test": test_name,
            "status": "SUCCESS" if status else "FAILURE",
            "message": message
        }

        if response:
            result["response"] = response

        self.results["tests"].append(result)

        if status:
            self.results["success"] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.results["failure"] += 1
            print(f"❌ {test_name}: {message}")

        return status

    def test_add_endpoint(self, x: int = 5, y: int = 3) -> bool:
        """
        Test the addition task endpoint.

        Args:
            x: First number
            y: Second number

        Returns:
            True if the test passed, False otherwise
        """
        test_name = "Addition Task"

        try:
            response = requests.get(f"{self.tasks_url}/add/?x={x}&y={y}")
            response_data = response.json()

            # Check response status code
            if response.status_code != 200:
                return self._log_result(test_name, False, f"Unexpected status code: {response.status_code}", response_data)

            # Check response format
            if not all(key in response_data for key in ["task_id", "message", "status"]):
                return self._log_result(test_name, False, "Missing required fields in response", response_data)

            # Store task ID for status check
            self.task_ids.append(response_data["task_id"])

            return self._log_result(
                test_name,
                True,
                f"Success - Task ID: {response_data['task_id']}",
                response_data
            )

        except Exception as e:
            return self._log_result(test_name, False, f"Error: {str(e)}")

    def test_multiply_endpoint(self, x: int = 4, y: int = 6) -> bool:
        """
        Test the multiplication task endpoint.

        Args:
            x: First number
            y: Second number

        Returns:
            True if the test passed, False otherwise
        """
        test_name = "Multiplication Task"

        try:
            response = requests.get(f"{self.tasks_url}/multiply/?x={x}&y={y}")
            response_data = response.json()

            # Check response status code
            if response.status_code != 200:
                return self._log_result(test_name, False, f"Unexpected status code: {response.status_code}", response_data)

            # Check response format
            if not all(key in response_data for key in ["task_id", "message", "status"]):
                return self._log_result(test_name, False, "Missing required fields in response", response_data)

            # Store task ID for status check
            self.task_ids.append(response_data["task_id"])

            return self._log_result(
                test_name,
                True,
                f"Success - Task ID: {response_data['task_id']}",
                response_data
            )

        except Exception as e:
            return self._log_result(test_name, False, f"Error: {str(e)}")

    def test_long_task_endpoint(self, duration: int = 2) -> bool:
        """
        Test the long running task endpoint.

        Args:
            duration: Duration of the task in seconds

        Returns:
            True if the test passed, False otherwise
        """
        test_name = "Long Running Task"

        try:
            response = requests.get(f"{self.tasks_url}/long/?duration={duration}")
            response_data = response.json()

            # Check response status code
            if response.status_code != 200:
                return self._log_result(test_name, False, f"Unexpected status code: {response.status_code}", response_data)

            # Check response format
            if not all(key in response_data for key in ["task_id", "message", "status"]):
                return self._log_result(test_name, False, "Missing required fields in response", response_data)

            # Store task ID for status check
            self.task_ids.append(response_data["task_id"])

            return self._log_result(
                test_name,
                True,
                f"Success - Task ID: {response_data['task_id']}",
                response_data
            )

        except Exception as e:
            return self._log_result(test_name, False, f"Error: {str(e)}")

    def test_email_task_endpoint(self, email: str = "test@example.com", subject: str = "Test Email", message: str = "This is a test email") -> bool:
        """
        Test the email task endpoint.

        Args:
            email: Recipient email address
            subject: Email subject
            message: Email message

        Returns:
            True if the test passed, False otherwise
        """
        test_name = "Email Task"

        try:
            payload = {
                "email": email,
                "subject": subject,
                "message": message
            }
            headers = {"Content-Type": "application/json"}

            response = requests.post(f"{self.tasks_url}/email/", data=json.dumps(payload), headers=headers)
            response_data = response.json()

            # Check response status code
            if response.status_code != 200:
                return self._log_result(test_name, False, f"Unexpected status code: {response.status_code}", response_data)

            # Check response format
            if not all(key in response_data for key in ["task_id", "message", "status"]):
                return self._log_result(test_name, False, "Missing required fields in response", response_data)

            # Store task ID for status check
            self.task_ids.append(response_data["task_id"])

            return self._log_result(
                test_name,
                True,
                f"Success - Task ID: {response_data['task_id']}",
                response_data
            )

        except Exception as e:
            return self._log_result(test_name, False, f"Error: {str(e)}")

    def test_task_status(self, task_id: str, expected_status: str = "SUCCESS", max_retries: int = 10) -> bool:
        """
        Test the task status endpoint.

        Args:
            task_id: ID of the task to check
            expected_status: Expected status of the task
            max_retries: Maximum number of retries

        Returns:
            True if the test passed, False otherwise
        """
        test_name = f"Task Status Check ({task_id})"

        try:
            retries = 0
            while retries < max_retries:
                response = requests.get(f"{self.tasks_url}/status/{task_id}/")
                response_data = response.json()

                # Check response status code
                if response.status_code != 200:
                    return self._log_result(test_name, False, f"Unexpected status code: {response.status_code}", response_data)

                # Check response format
                if not all(key in response_data for key in ["task_id", "status", "ready"]):
                    return self._log_result(test_name, False, "Missing required fields in response", response_data)

                # Check if task is complete with expected status
                if response_data["ready"] and response_data["status"] == expected_status:
                    return self._log_result(
                        test_name,
                        True,
                        f"Success - Task completed with status: {response_data['status']}",
                        response_data
                    )

                # Wait and retry
                retries += 1
                time.sleep(1)

            return self._log_result(
                test_name,
                False,
                f"Task did not complete with expected status '{expected_status}' within {max_retries} retries",
                response_data
            )

        except Exception as e:
            return self._log_result(test_name, False, f"Error: {str(e)}")

    def run_all_tests(self) -> Dict[str, Any]:
        """
        Run all tests and return the results.

        Returns:
            Dictionary with test results
        """
        print("\n===== Testing Django-Celery API Endpoints =====\n")

        # Test endpoints that create tasks
        self.test_add_endpoint()
        self.test_multiply_endpoint()
        self.test_long_task_endpoint(duration=1)  # Short duration for testing
        self.test_email_task_endpoint()

        # Wait for tasks to complete
        print("\nWaiting for tasks to complete...")
        time.sleep(3)

        # Test task status endpoint for each task
        for task_id in self.task_ids:
            self.test_task_status(task_id)

        print(f"\n===== Test Results: {self.results['success']} Passed, {self.results['failure']} Failed =====\n")

        return self.results


def main():
    parser = argparse.ArgumentParser(description="Test Django-Celery API endpoints")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL of the Django application")
    args = parser.parse_args()

    # Run tests
    tester = APITester(base_url=args.url)
    results = tester.run_all_tests()

    # Exit with appropriate status code
    if results["failure"] > 0:
        print("Some tests failed.")
        sys.exit(1)
    else:
        print("All tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
