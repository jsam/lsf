#!/bin/sh
set -e

echo "Entrypoint script is running..."

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up - continuing"

# Apply database migrations
echo "Applying migrations..."
python manage.py migrate

# Collect static files WITHOUT --clear to avoid deletion issues
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if needed
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_EMAIL" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Creating superuser..."
  python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
" 2>/dev/null || echo "Superuser creation skipped"
fi

# Start server
echo "Command received: $@"
if [ "$1" = "celery" ]; then
  echo "Starting Celery worker..."
  exec celery -A django_celery_base worker --loglevel=info
else
  echo "Starting Django server with improved Gunicorn settings..."
  exec gunicorn django_celery_base.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class sync \
    --timeout 120 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload \
    --access-logfile - \
    --error-logfile -
fi