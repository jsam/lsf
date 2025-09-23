from django.db import models
import uuid

from .bitbucket_project import BitbucketProject

class Application(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    soxestimeApplicationID = models.CharField(max_length=255, unique=True)
    soxesPlanningProjectID = models.CharField(max_length=255, blank=True, null=True)
    jiraKey = models.CharField(max_length=255, blank=True, null=True)
    bitbucketProject = models.ForeignKey(BitbucketProject, db_column='bitbucketProject', on_delete=models.SET_NULL, null=True)
    Name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applications'
