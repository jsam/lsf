#!/bin/bash

# Docker Integration Test Suite
# Run all Docker build and runtime tests

# Don't exit on error - we want to run all tests
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print colored output
print_color() {
    echo -e "${1}${2}${NC}"
}

# Function to print header
print_header() {
    echo
    print_color "$BLUE" "========================================================"
    print_color "$BLUE" "$1"
    print_color "$BLUE" "========================================================"
}

# Function to run a test and track results
run_test() {
    local test_name=$1
    local test_file=$2

    print_header "$test_name"

    if [ -f "$test_file" ]; then
        python3 "$test_file"
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            print_color "$GREEN" "✅ $test_name PASSED"
            ((PASSED_TESTS++))
        else
            print_color "$RED" "❌ $test_name FAILED"
            ((FAILED_TESTS++))
        fi
    else
        print_color "$YELLOW" "⚠️ $test_name SKIPPED (file not found: $test_file)"
        ((FAILED_TESTS++))
    fi

    ((TOTAL_TESTS++))
}

# Main test execution
main() {
    print_header "DOCKER INTEGRATION TEST SUITE"
    print_color "$YELLOW" "Starting test suite at $(date)"

    # Check if we're in the correct directory
    if [ ! -f "src/docker-compose.yml" ]; then
        print_color "$RED" "Error: src/docker-compose.yml not found."
        print_color "$RED" "Please run this script from the lsf directory (parent of src)."
        exit 1
    fi

    # Parse command line arguments
    RUN_BUILD_TESTS=true
    RUN_RUNTIME_TESTS=true
    KEEP_RUNNING=false

    # Clean up docker env
    #Remove ALL containers (running and stopped):
    docker rm -f $(docker ps -aq)

    while [[ $# -gt 0 ]]; do
        case $1 in
            --build-only)
                RUN_RUNTIME_TESTS=false
                shift
                ;;
            --runtime-only)
                RUN_BUILD_TESTS=false
                shift
                ;;
            --keep-running)
                KEEP_RUNNING=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --build-only     Run only build tests"
                echo "  --runtime-only   Run only runtime tests (requires services to be running)"
                echo "  --keep-running   Keep Docker services running after tests"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                print_color "$RED" "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Run build tests
    
    if [ "$RUN_BUILD_TESTS" = true ]; then
        run_test "Docker Build Tests" "tests/test_docker_build.py"
    fi

    # Run runtime tests
    if [ "$RUN_RUNTIME_TESTS" = true ]; then
        # Check if services are already running
        SERVICES_RUNNING=$(cd src && docker compose ps --services --filter status=running | grep -c .)
      
        if [ "$SERVICES_RUNNING" -gt 0 ]; then
            print_color "$YELLOW" "Docker services are already running. Using existing services."

            # Run health and functionality tests
            run_test "Service Health Checks" "tests/test_service_health.py"
            run_test "Celery Task Tests" "tests/test_celery_tasks.py"
        else
            # Run the runtime test which manages its own services
            run_test "Docker Runtime Tests" "tests/test_docker_runtime.py"

            # Start services for other tests
            print_color "$YELLOW" "Starting Docker services for additional tests..."
            (cd src && docker compose up -d)

            # Wait for services to be ready
            print_color "$YELLOW" "Waiting for services to be ready..."
            sleep 30

            # Run additional tests
            run_test "Service Health Checks" "tests/test_service_health.py"
            run_test "Celery Task Tests" "tests/test_celery_tasks.py"

            # Clean up if not keeping services running
            if [ "$KEEP_RUNNING" = false ]; then
                print_color "$YELLOW" "Cleaning up Docker services..."
                (cd src && docker compose down)
            else
                print_color "$YELLOW" "Docker services left running (use 'cd src && docker compose down' to stop)"
            fi
        fi
    fi

    # Print summary
    print_header "TEST SUITE SUMMARY"
    echo "Total Tests Run: $TOTAL_TESTS"
    print_color "$GREEN" "Passed: $PASSED_TESTS"
    print_color "$RED" "Failed: $FAILED_TESTS"

    if [ "$FAILED_TESTS" -eq 0 ]; then
        print_color "$GREEN" "🎉 All tests passed successfully!"
        exit 0
    else
        print_color "$RED" "❌ Some tests failed. Please review the output above."
        exit 1
    fi
}

# Run main function
main "$@"