from django.db import models
import uuid

from .application import Application

class BillingProject(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    project_name = models.CharField(max_length=255)
    soxestime_ID = models.CharField(max_length=255)
    soxestime_application_ID = models.ForeignKey(
        Application,
        to_field='soxestimeApplicationID',
        db_column='soxestime_application_ID',
        null=True,
        on_delete=models.SET_NULL
    )
    external_ticketing = models.CharField(max_length=255, blank=True, null=True)
    external_repo = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    sales_price = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    estimated_cost = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    employees_cost = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    additional_cost = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    is_external = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    application = models.ForeignKey(Application, related_name='billing_projects', on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'BILLING_PROJECT'
