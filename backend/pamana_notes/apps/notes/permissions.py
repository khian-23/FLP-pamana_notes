from rest_framework.permissions import BasePermission

class IsAdminOrModerator(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_staff or user.groups.filter(name="moderator").exists()
