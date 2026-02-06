from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from apps.accounts.api.serializers import AdminUserSerializer

User = get_user_model()


class AdminUsersList(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by("school_id")
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)


class AdminChangeUserRole(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        role = request.data.get("role")

        if role not in ["student", "moderator", "admin"]:
            return Response(
                {"detail": "Invalid role"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_object_or_404(User, pk=pk)

        if role != "admin" and user.is_superuser:
            if User.objects.filter(is_superuser=True).count() <= 1:
                return Response(
                    {"detail": "Cannot remove the last admin."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if role == "student":
            user.is_staff = False
            user.is_superuser = False
            user.role = "student"
        elif role == "moderator":
            user.is_staff = True
            user.is_superuser = False
            user.role = "moderator"
        elif role == "admin":
            user.is_staff = True
            user.is_superuser = True
            user.role = "admin"

        user.save()
        return Response({"detail": "Role updated"})

class AdminToggleUserStatus(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()

        return Response({"detail": "User status updated"})
