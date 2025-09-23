from django.db import models
from django.db.models import JSONField

from .employee import Employee
from .pull_request import PullRequest

class Commit(models.Model):
    hash = models.CharField(max_length=255, primary_key=True)
    repo_uuid = models.CharField(max_length=36)
    repo_slug = models.CharField(max_length=255, blank=True, null=True)
    workspace = models.CharField(max_length=255, blank=True, null=True)
    pr = models.ForeignKey(PullRequest, db_column='pr_uuid', on_delete=models.SET_NULL, null=True)
    author = models.ForeignKey(Employee, db_column='author_uuid', on_delete=models.SET_NULL, null=True)
    author_raw = models.CharField(max_length=255, blank=True, null=True)
    author_account_id = models.CharField(max_length=255, blank=True, null=True)
    author_display_name = models.CharField(max_length=255, blank=True, null=True)
    author_nickname = models.CharField(max_length=255, blank=True, null=True)
    author_type = models.CharField(max_length=50, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    summary = models.CharField(max_length=255, blank=True, null=True)
    date = models.DateTimeField()
    parents_count = models.IntegerField(default=0)
    parent_hashes = JSONField(blank=True, null=True)
    additions = models.IntegerField(default=0)
    deletions = models.IntegerField(default=0)
    files_changed = models.IntegerField(default=0)
    branch = models.CharField(max_length=255, blank=True, null=True)
    tags = JSONField(blank=True, null=True)
    html_url = models.CharField(max_length=255, blank=True, null=True)
    rendered_message = models.TextField(blank=True, null=True)
    rendered_message_type = models.CharField(max_length=50, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    approval_count = models.IntegerField(default=0)
    links = JSONField(blank=True, null=True)
    properties = JSONField(blank=True, null=True)
    fetched_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'COMMIT'
        indexes = [
            models.Index(fields=['pr'], name='idx_commit_pr'),
            models.Index(fields=['author'], name='idx_commit_author'),
            models.Index(fields=['repo_uuid'], name='idx_commit_repo'),
            models.Index(fields=['date'], name='idx_commit_date'),
            models.Index(fields=['branch'], name='idx_commit_branch'),
            models.Index(fields=['author_raw'], name='idx_commit_author_raw'),
        ]
