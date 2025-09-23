# Django Celery Base Project
# Django Celery Base with Docker

A basic Django project with Celery integration for handling asynchronous tasks, dockerized with PostgreSQL and Redis.

## Docker Setup

### Running the Application

To run the entire application stack using Docker Compose:

```bash
docker-compose up --build
```

This will start:
- Django web application on http://localhost:8000 (using Gunicorn)
- Celery worker
- Redis message broker
- PostgreSQL database

The application comes with a default admin user (configured in docker-compose.yml):
- Username: admin
- Email: admin@example.com
- Password: adminpassword

You can access the Django admin interface at http://localhost:8000/admin/

### Stopping the Application

```bash
docker-compose down
```

If you want to clean up the volumes as well:

```bash
docker-compose down -v
```

## Testing the Application

### Automated Testing

A test script is included to test all API endpoints automatically:

```bash
# When running locally
python test_endpoints.py

# When testing a remote or specific instance
python test_endpoints.py --url http://localhost:8000
```

The test script will:
1. Test the addition task endpoint
2. Test the multiplication task endpoint
3. Test the long running task endpoint
4. Test the email task endpoint
5. Check the status of all tasks

All test results will be displayed in the console with a summary of passes and failures.

### Manual Testing

Once all containers are up and running, you can manually test the API endpoints:

#### Quick Test - Addition Task:

```bash
curl "http://localhost:8000/tasks/add/?x=5&y=3"
```

Expected response:
```json
{
  "task_id": "some-uuid-here",
  "message": "Addition task started with 5 + 3",
  "status": "PENDING"
}
```

#### Test Other Tasks:

```bash
# Multiplication
curl "http://localhost:8000/tasks/multiply/?x=4&y=6"

# Long running task (5 seconds)
curl "http://localhost:8000/tasks/long/?duration=5"

# Email task (POST request)
curl -X POST http://localhost:8000/tasks/email/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subject": "Test", "message": "Hello World"}'
```

#### Check Task Status:

Copy the `task_id` from any response and check its status:

```bash
curl "http://localhost:8000/tasks/status/YOUR_TASK_ID_HERE/"
```

## Container Details

1. **Web**: Django application running on Gunicorn
2. **Celery**: Celery worker for task processing
3. **Redis**: Message broker for Celery
4. **PostgreSQL**: Database for the application

## Environment Variables

The following environment variables can be configured in the docker-compose.yml file:

- `DEBUG`: Set to 1 for development, 0 for production
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: PostgreSQL connection string
- `CELERY_BROKER_URL`: Redis connection string for Celery broker
- `CELERY_RESULT_BACKEND`: Redis connection string for Celery results

## Data Persistence

Data is persisted using Docker volumes:

- `postgres_data`: PostgreSQL data
- `redis_data`: Redis data
A basic Django project with Celery integration for handling asynchronous tasks.

## Setup Instructions

1. **Create a virtual environment and activate it:**
   ```bash
   virtualenv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Django migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start Redis server** (ensure Redis is installed):
   ```bash
   redis-server
   ```

6. **Start Celery worker** (in a new terminal):
   ```bash
   celery -A django_celery_base worker --loglevel=info
   ```

7. **Start Django development server** (in another terminal):
   ```bash
   python manage.py runserver
   ```

## Testing the Setup

You can test the Celery tasks by visiting these URLs:

- `http://127.0.0.1:8000/tasks/add/?x=5&y=3` - Addition task
- `http://127.0.0.1:8000/tasks/multiply/?x=4&y=6` - Multiplication task
- `http://127.0.0.1:8000/tasks/long/?duration=5` - Long running task
- `http://127.0.0.1:8000/tasks/status/TASK_ID/` - Check task status (replace TASK_ID with an actual task ID)

For the email task, use POST request:
```bash
curl -X POST http://127.0.0.1:8000/tasks/email/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subject": "Test", "message": "Hello World"}'
```
