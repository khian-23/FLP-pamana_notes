from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from django.shortcuts import get_object_or_404
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from PIL import Image

from apps.accounts.models import CustomUser, Profile
from apps.accounts.api.serializers import (
    StudentProfileSerializer,
    StudentProfileUpdateSerializer,
)
from apps.notes.models import Note


MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_AVATAR_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
]


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
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        return self._update(request)

    def patch(self, request):
        return self._update(request)

    def _update(self, request):
        user = request.user

        # 🔒 Role guard
        if user.role != CustomUser.Role.STUDENT:
            return Response(
                {"detail": "Only students can update profiles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        profile = get_object_or_404(Profile, user=user)

        # ============================
        # EMAIL VALIDATION
        # ============================
        email = request.data.get("email")
        if email:
            try:
                validate_email(email)
            except ValidationError:
                return Response(
                    {"email": "Enter a valid email address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Optional uniqueness check (safe)
            if CustomUser.objects.exclude(pk=user.pk).filter(email=email).exists():
                return Response(
                    {"email": "This email is already in use."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # ============================
        # AVATAR VALIDATION
        # ============================
        avatar = request.FILES.get("avatar")
        if avatar:
            if avatar.content_type not in ALLOWED_AVATAR_TYPES:
                return Response(
                    {"avatar": "Only JPG, PNG, or WEBP images are allowed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if avatar.size > MAX_AVATAR_SIZE:
                return Response(
                    {"avatar": "Avatar size must be 2MB or less."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                image = Image.open(avatar)
                image.verify()
                avatar.seek(0)
            except Exception:
                return Response(
                    {"avatar": "Invalid image file."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
