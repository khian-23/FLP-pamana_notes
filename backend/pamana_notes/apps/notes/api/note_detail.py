from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied

from django.core.exceptions import ValidationError
from apps.notes.models import Note, validate_file_type
from apps.notes.api.serializers import AdminNoteSerializer


class NoteDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        note = get_object_or_404(Note, pk=pk, is_deleted=False)
        if not note.can_view(request.user):
            raise PermissionDenied
        return Response(
            AdminNoteSerializer(note, context={"request": request}).data
        )

    def patch(self, request, pk):
        note = get_object_or_404(Note, pk=pk, is_deleted=False)
        if not note.can_view(request.user):
            raise PermissionDenied

        if note.uploader != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN,
            )

        note.title = request.data.get("title", note.title)
        note.description = request.data.get("description", note.description)

        if "file" in request.FILES:
            note.file = request.FILES["file"]
            try:
                validate_file_type(note.file)
            except ValidationError as exc:
                return Response(
                    {"file": exc.message},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        note.is_approved = False
        note.is_rejected = False
        note.rejection_reason = ""

        note.save()

        return Response(
            AdminNoteSerializer(note, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
