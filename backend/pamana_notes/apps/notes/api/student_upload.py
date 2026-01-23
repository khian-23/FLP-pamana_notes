from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.notes.models import Note
from apps.subjects.models import Subject
from apps.notes.api.serializers import AdminNoteSerializer


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class StudentUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        title = (request.data.get("title") or "").strip()
        description = (request.data.get("description") or "").strip()
        subject_id = request.data.get("subject")
        visibility = request.data.get("visibility")
        file = request.FILES.get("file")

        # ============================
        # VALIDATION
        # ============================
        if not title:
            return Response(
                {"title": "Title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not description and not file:
            return Response(
                {"detail": "Provide a description or upload a file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not subject_id:
            return Response(
                {"detail": "Subject is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = Subject.objects.filter(id=subject_id).first()
        if not subject:
            return Response(
                {"detail": "Invalid subject."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ============================
        # FILE SIZE ONLY (ANY TYPE)
        # ============================
        if file and file.size > MAX_FILE_SIZE:
            return Response(
                {"file": "File size must be 10MB or less."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ============================
        # VISIBILITY RULES
        # ============================
        if visibility == "course" and subject.course is None:
            return Response(
                {"detail": "General subjects cannot use course visibility."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if visibility == "course" and subject.course != user.course:
            return Response(
                {"detail": "You cannot upload a course note for another course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ============================
        # CREATE NOTE (PENDING)
        # ============================
        note = Note.objects.create(
            uploader=user,
            title=title,
            description=description,
            file=file,
            subject=subject,
            visibility=visibility,
            is_approved=False,
            is_rejected=False,
            rejection_reason="",
        )

        return Response(
            AdminNoteSerializer(
                note,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )
