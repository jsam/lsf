from django.db import models
import uuid

from .bitbucket_repository import BitbucketRepository

class PullRequest(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    repository_ID = models.CharField(max_length=255)
    repository = models.ForeignKey(BitbucketRepository, related_name='pull_requests', db_column='repository_uid', on_delete=models.SET_NULL, null=True)
    LOC_changed = models.IntegerField(blank=True, null=True)
    start_time = models.DateTimeField()
    active_time = models.DateTimeField()
    merged_time = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'PR'
        indexes = [
            models.Index(fields=['repository_ID'], name='idx_pr_repo'),
            models.Index(fields=['repository'], name='idx_pr_repo_uid'),
        ]
