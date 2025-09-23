from django.db import models
from django.db.models import JSONField

from .commit import Commit

class DiffStat(models.Model):
    uid = models.CharField(max_length=36, primary_key=True)
    commit = models.ForeignKey(Commit, db_column='commit_hash', on_delete=models.CASCADE)
    file_path = models.CharField(max_length=255)
    old_path = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)
    binary = models.BooleanField(default=False)
    lines_added = models.IntegerField(default=0)
    lines_removed = models.IntegerField(default=0)
    is_renamed = models.BooleanField(default=False)
    is_copied = models.BooleanField(default=False)
    similarity_percent = models.IntegerField(blank=True, null=True)
    type = models.CharField(max_length=50, default='diffstat')
    extension = models.CharField(max_length=50, blank=True, null=True)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    source_node_id = models.CharField(max_length=255, blank=True, null=True)
    target_node_id = models.CharField(max_length=255, blank=True, null=True)
    links = JSONField(blank=True, null=True)
    properties = JSONField(blank=True, null=True)
    fetched_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'DIFFSTAT'
        indexes = [
            models.Index(fields=['commit'], name='idx_diffstat_commit_hash'),
            models.Index(fields=['file_path'], name='idx_diffstat_file_path'),
            models.Index(fields=['status'], name='idx_diffstat_status'),
        ]
