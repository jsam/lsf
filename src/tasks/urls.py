from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.trigger_add_task, name='trigger_add'),
    path('multiply/', views.trigger_multiply_task, name='trigger_multiply'),
    path('long/', views.trigger_long_task, name='trigger_long'),
    path('email/', views.trigger_email_task, name='trigger_email'),
    path('status/<str:task_id>/', views.get_task_status, name='task_status'),
]
