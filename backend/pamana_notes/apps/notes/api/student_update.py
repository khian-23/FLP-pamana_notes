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

        # 🚫 Approved notes are LOCKED
        if note.is_approved:
            return Response(
                {"detail": "Approved notes can no longer be edited."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ✏️ Apply updates
        note.title = request.data.get("title", note.title)
        note.description = request.data.get("description", note.description)

        if "file" in request.FILES:
            note.file = request.FILES["file"]

        # 🔄 Reset moderation state
        note.is_approved = False
        note.is_rejected = False
        note.rejection_reason = ""

        note.save()

        return Response(
            AdminNoteSerializer(note, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
