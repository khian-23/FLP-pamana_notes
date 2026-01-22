from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.api.auth import CustomTokenObtainPairView
from apps.accounts.api.register import RegisterAPIView
from apps.accounts.api.admin_users import (
    AdminUsersList,
    AdminChangeUserRole,
    AdminToggleUserStatus,
)
from apps.accounts.api.profile import (
    ProfileAPIView,
    StudentProfileAPIView,
    StudentProfileUpdateAPIView,
)

urlpatterns = [
    # ============================
    # Admin User Management
    # ============================
    path("users/", AdminUsersList.as_view()),
    path("users/<int:pk>/role/", AdminChangeUserRole.as_view()),
    path("users/<int:pk>/status/", AdminToggleUserStatus.as_view()),

    # ============================
    # Authentication
    # ============================
    path("register/", RegisterAPIView.as_view()),
    path("auth/token/", CustomTokenObtainPairView.as_view()),
    path("auth/token/refresh/", TokenRefreshView.as_view()),

    # ============================
    # Profiles
    # ============================
    path("profile/", ProfileAPIView.as_view()),
    path("student/profile/", StudentProfileAPIView.as_view()),
    path("student/profile/update/", StudentProfileUpdateAPIView.as_view()),
]
