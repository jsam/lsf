from django.db import models
import uuid

from .bitbucket_project import BitbucketProject

class BitbucketRepository(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(BitbucketProject, related_name='repositories', db_column='project_uid', on_delete=models.CASCADE, null=True)
    workspace = models.CharField(max_length=255)
    repo_slug = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_private = models.BooleanField(default=True)
    fork_policy = models.CharField(max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    language = models.CharField(max_length=255, blank=True, null=True)
    has_issues = models.BooleanField(default=False)
    has_wiki = models.BooleanField(default=False)
    scm = models.CharField(max_length=255, blank=True, null=True)
    size = models.IntegerField(blank=True, null=True)
    created_on = models.DateTimeField(blank=True, null=True)
    updated_on = models.DateTimeField(blank=True, null=True)
    owner = models.CharField(max_length=255, blank=True, null=True)
    parent_slug = models.CharField(max_length=255, blank=True, null=True)
    uuid = models.CharField(max_length=255, blank=True, null=True)
    links = models.TextField(blank=True, null=True)
    main_branch = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'BITBUCKET_REPOSITORY'
