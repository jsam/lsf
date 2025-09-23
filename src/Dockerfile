FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Copy entrypoint script and make it executable
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh && \
    # Ensure the script has Unix line endings
    sed -i 's/\r$//' /app/entrypoint.sh

# Copy project
COPY . /app/

# Create static files directory
RUN mkdir -p /app/staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput --settings=django_celery_base.settings || echo "Static files collection failed, will retry in entrypoint"

# Make sure the entrypoint.sh is still executable after copying the project
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Use shell form to ensure proper execution
CMD ["/bin/sh", "-c", "/app/entrypoint.sh"]