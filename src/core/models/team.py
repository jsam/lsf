from django.db import models
import uuid

class Team(models.Model):
    uid = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    team_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'TEAM'
