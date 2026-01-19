from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from accounts.api.serializers import AdminUserSerializer

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

        user = User.objects.get(pk=pk)

        if role == "student":
            user.is_staff = False
            user.is_superuser = False
        elif role == "moderator":
            user.is_staff = True
            user.is_superuser = False
        elif role == "admin":
            user.is_staff = True
            user.is_superuser = True

        user.save()
        return Response({"detail": "Role updated"})

class AdminToggleUserStatus(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        user = User.objects.get(pk=pk)
        user.is_active = not user.is_active
        user.save()

        return Response({"detail": "User status updated"})
