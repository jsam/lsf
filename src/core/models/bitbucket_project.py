from django.db import models
import uuid

class BitbucketProject(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.CharField(max_length=255)
    project_key = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_private = models.BooleanField(default=True)
    has_publicly_visible_repos = models.BooleanField(default=False)
    created_on = models.DateTimeField(blank=True, null=True)
    updated_on = models.DateTimeField(blank=True, null=True)
    uuid = models.CharField(max_length=255, blank=True, null=True)
    links = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'BITBUCKET_PROJECT'
