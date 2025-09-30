from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    # Authentication endpoints (GREEN-002, 004, 006)
    path('auth/login/', views.auth_login, name='auth_login'),
    path('auth/me/', views.auth_me, name='auth_me'),
    path('auth/logout/', views.auth_logout, name='auth_logout'),
]