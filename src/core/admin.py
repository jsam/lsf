from django.contrib import admin
from .models import (
    Team, Employee, BillingProject, TimeBooking, JiraTimeLog, Ticket,
    BitbucketProject, BitbucketRepository, Application, PullRequest,
    Commit, DiffStat, Planning
)

models = [
    Team, Employee, BillingProject, TimeBooking, JiraTimeLog, Ticket,
    BitbucketProject, BitbucketRepository, Application, PullRequest,
    Commit, DiffStat, Planning
]

for model in models:
    admin.site.register(model)
