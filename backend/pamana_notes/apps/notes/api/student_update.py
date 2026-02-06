from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.shortcuts import get_object_or_404

from django.core.exceptions import ValidationError
from apps.notes.models import Note, validate_file_type
from apps.notes.api.serializers import AdminNoteSerializer


class StudentNoteUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "upload"

    def patch(self, request, pk):
        note = get_object_or_404(Note, pk=pk)

        # 🔐 Only owner can edit
        if note.uploader != request.user:
            return Response(
                {"detail": "You do not own this note."},
                status=status.HTTP_403_FORBIDDEN,
            )

        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        visibility = request.data.get("visibility")
        has_file = "file" in request.FILES or bool(note.file)

        # ✅ Validation
        if not title:
            return Response(
                {"title": "Title cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not description and not has_file:
            return Response(
                {"detail": "Provide a description or upload a file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if visibility is not None and visibility not in dict(Note.VISIBILITY_CHOICES):
            return Response(
                {"visibility": "Invalid visibility."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✏️ Apply updates
        note.title = title
        note.description = description
        if visibility is not None:
            note.visibility = visibility

        if "file" in request.FILES:
            note.file = request.FILES["file"]
            try:
                validate_file_type(note.file)
            except ValidationError as exc:
                return Response(
                    {"file": exc.message},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 🔄 Reset moderation state on edit
        note.is_approved = False
        note.is_rejected = False
        note.rejection_reason = ""

        note.save()

        return Response(
            AdminNoteSerializer(note, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        note = get_object_or_404(Note, pk=pk)

        # 🔐 Only owner can delete
        if note.uploader != request.user:
            return Response(
                {"detail": "You do not own this note."},
                status=status.HTTP_403_FORBIDDEN,
            )

        note.is_deleted = True
        note.save(update_fields=["is_deleted"])
        return Response(status=status.HTTP_204_NO_CONTENT)
