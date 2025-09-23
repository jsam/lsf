from django.db import models
import uuid

from .team import Team

class Employee(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    organisation = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, unique=True, blank=True, null=True)
    atlassian_user_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    soxestime_user_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    soxesplanning_user_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    team = models.ForeignKey(Team, related_name='employees', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'EMPLOYEE'
