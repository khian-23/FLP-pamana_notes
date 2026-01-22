from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from django.shortcuts import get_object_or_404

from apps.accounts.models import CustomUser, Profile
from apps.accounts.api.serializers import (
    StudentProfileSerializer,
    StudentProfileUpdateSerializer,
)
from apps.notes.models import Note


# ======================================================
# STUDENT PROFILE (GET)
# ======================================================
class StudentProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        return Response(
            StudentProfileSerializer(
                profile, context={"request": request}
            ).data
        )


# ======================================================
# STUDENT PROFILE UPDATE (PATCH / PUT)
# ======================================================
class StudentProfileUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # ✅ REQUIRED FOR AVATAR

    def put(self, request):
        return self._update(request)

    def patch(self, request):
        return self._update(request)

    def _update(self, request):
        user = request.user

        if user.role != CustomUser.Role.STUDENT:
            return Response(
                {"detail": "Only students can update profiles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        profile = get_object_or_404(Profile, user=user)

        serializer = StudentProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            StudentProfileSerializer(
                profile, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )


# ======================================================
# GENERIC PROFILE (HEADER / DASHBOARD)
# ======================================================
class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        notes_count = Note.objects.filter(uploader=user).count()

        return Response({
            "school_id": user.school_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "course": user.course.name if user.course else None,
            "notes_count": notes_count,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        })
