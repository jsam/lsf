from django.db import models
import uuid

from .employee import Employee
from .application import Application
from .team import Team

class Planning(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, db_column='employee_ID', on_delete=models.CASCADE)
    application = models.ForeignKey(Application, db_column='application_id', on_delete=models.SET_NULL, null=True)
    planned_hours = models.DecimalField(max_digits=10, decimal_places=2)
    calendar_week = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    team = models.ForeignKey(Team, db_column='team_ID', on_delete=models.CASCADE)

    class Meta:
        db_table = 'PLANNING'
