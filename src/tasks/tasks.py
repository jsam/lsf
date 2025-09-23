from celery import shared_task
import time
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)


@shared_task
def add(x, y):
    """Simple addition task."""
    return x + y


@shared_task
def multiply(x, y):
    """Simple multiplication task."""
    return x * y


@shared_task
def long_running_task(duration=10):
    """Simulate a long-running task."""
    logger.info(f"Starting long running task for {duration} seconds")
    time.sleep(duration)
    logger.info("Long running task completed")
    return f"Task completed after {duration} seconds"


@shared_task
def send_email_task(email, subject, message):
    """Simulate sending an email."""
    logger.info(f"Sending email to {email}")
    # Simulate email sending delay
    time.sleep(2)
    logger.info(f"Email sent to {email} with subject: {subject}")
    return f"Email sent to {email}"
