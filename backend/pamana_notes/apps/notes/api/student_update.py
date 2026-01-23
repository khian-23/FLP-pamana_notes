from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class StudentNoteUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

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

        # ✏️ Apply updates
        note.title = title
        note.description = description

        if "file" in request.FILES:
            note.file = request.FILES["file"]

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

        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
