"""
URL routes for City Care API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
# basename required because queryset is not provided in ViewSet
router.register(r'complaints', views.ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    # Complaint Actions
    path('complaints/<str:complaint_id>/assign/', views.AssignComplaintView.as_view(), name='assign-complaint'),
    path('complaints/<str:complaint_id>/resolve/', views.ResolveComplaintView.as_view(), name='resolve-complaint'),
    path('complaints/<str:complaint_id>/reject/', views.RejectComplaintView.as_view(), name='reject-complaint'),
    
    # Simulation & Stats
    path('simulate-timeout/', views.SimulateTimeoutView.as_view(), name='simulate-timeout'),
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
]
