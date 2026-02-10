# backend/student/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.student_form, name='student_form'),
    path('submit/', views.submit_billing, name='submit_billing'),
    path('success/', views.success_page, name='success'),
]