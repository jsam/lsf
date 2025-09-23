# Docker Integration Tests

This directory contains comprehensive integration tests for the Docker-based Django/Celery application.

## Test Files

1. **test_docker_build.py** - Tests the Docker image build process
   - Validates Dockerfile instructions
   - Checks installed dependencies
   - Verifies image configuration

2. **test_docker_runtime.py** - Tests the full Docker Compose stack
   - Starts all services
   - Validates container status
   - Tests inter-service communication
   - Runs basic functionality tests
   - Automatically manages service lifecycle

3. **test_service_health.py** - Health checks for running services
   - PostgreSQL health and connectivity
   - Redis health and connectivity
   - Django application health
   - Celery worker health
   - HTTP endpoint availability
   - Resource usage monitoring

4. **test_celery_tasks.py** - Celery functionality tests
   - Task execution (add, multiply, long-running, email)
   - Concurrent task execution
   - Task chaining
   - Result backend verification
   - Error handling

## Running Tests

### Run All Tests
```bash
# From the project root directory
chmod +x tests/run_all_tests.sh
./tests/run_all_tests.sh
```

### Run Specific Test Suites
```bash
# Build tests only
./tests/run_all_tests.sh --build-only

# Runtime tests only (requires services to be running)
./tests/run_all_tests.sh --runtime-only

# Keep services running after tests
./tests/run_all_tests.sh --keep-running
```

### Run Individual Tests
```bash
# Docker build tests
python tests/test_docker_build.py

# Docker runtime tests (manages its own services)
python tests/test_docker_runtime.py

# Service health checks (requires running services)
docker compose up -d
python tests/test_service_health.py

# Celery task tests (requires running services)
docker compose up -d
python tests/test_celery_tasks.py
```

## Prerequisites

- Docker and Docker Compose installed
- Python 3.x with `requests` library
- Services should NOT be running for `test_docker_runtime.py`
- Services SHOULD be running for `test_service_health.py` and `test_celery_tasks.py`

## Test Coverage

### Build Tests
- Docker image builds successfully
- Required Python packages installed
- Entrypoint script exists
- Static files directory structure

### Runtime Tests
- All containers start and run
- Database connectivity
- Redis connectivity
- Web service accessibility
- Django admin interface
- Celery worker functionality
- Migrations applied
- Environment variables set

### Health Checks
- Service status monitoring
- Resource usage tracking
- Volume mounts verification
- Network connectivity between services
- Logging configuration

### Celery Tests
- Simple task execution
- Long-running tasks
- Concurrent task execution
- Task chaining
- Result backend storage
- Error handling

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Docker Integration Tests
  run: |
    ./tests/run_all_tests.sh
```

## Troubleshooting

If tests fail:

1. Check Docker daemon is running: `docker info`
2. Check for port conflicts: `docker compose ps`
3. Review container logs: `docker compose logs [service]`
4. Ensure clean state: `docker compose down -v`
5. Rebuild images: `docker compose build --no-cache`

## Exit Codes

- 0: All tests passed
- 1: One or more tests failed

## Notes

- Tests use actual Docker containers (not mocks)
- Some tests may take time due to container startup
- Resource-intensive tests may require adequate system resources
- Network tests assume default Docker networking