from django.urls import path
from apps.accounts.api.admin_users import (
    AdminUsersList,
    AdminChangeUserRole,
    AdminToggleUserStatus,
)

urlpatterns = [
    path("users/", AdminUsersList.as_view(), name="admin-users"),
    path("users/<int:pk>/role/", AdminChangeUserRole.as_view(), name="admin-user-role"),
    path("users/<int:pk>/status/", AdminToggleUserStatus.as_view(), name="admin-user-status"),
]
