from django.db import models
import uuid

from .employee import Employee
from .billing_project import BillingProject

class TimeBooking(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, db_column='employee_ID', on_delete=models.CASCADE)
    booking_date = models.DateField()
    billing_project = models.ForeignKey(BillingProject, db_column='billing_project_ID', on_delete=models.CASCADE)
    time_booked = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'TIME_BOOKING'
        indexes = [
            models.Index(fields=['employee'], name='idx_tb_employee_id'),
            models.Index(fields=['billing_project'], name='idx_tb_bill_project_id'),
        ]
