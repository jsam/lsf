from django.db import models
import uuid

from .employee import Employee
from .ticket import Ticket

class JiraTimeLog(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, db_column='employee_ID', on_delete=models.CASCADE)
    booking_date = models.DateField()
    ticket = models.ForeignKey('Ticket', db_column='ticket_ID', on_delete=models.CASCADE)
    time_booked = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jira_time_log'
        indexes = [
            models.Index(fields=['employee'], name='idx_jiratimelog_employee_id'),
            models.Index(fields=['ticket'], name='idx_jiratimelog_ticket_id'),
        ]
