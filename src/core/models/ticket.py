from django.db import models
import uuid

from .application import Application
from .employee import Employee

class Ticket(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    ticket_ID = models.CharField(max_length=255)
    Jira_key = models.CharField(max_length=255, blank=True, null=True)
    application = models.ForeignKey(Application, db_column='application_id', on_delete=models.CASCADE)
    employee = models.ForeignKey(Employee, db_column='employee_ID', on_delete=models.CASCADE)
    time_logged = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'TICKET'
        indexes = [
            models.Index(fields=['application'], name='idx_ticket_project'),
        ]
