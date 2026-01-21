from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class NoteDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        note = get_object_or_404(
            Note,
            pk=pk,
            is_deleted=False,
            is_approved=True,
        )

        return Response(
            AdminNoteSerializer(
                note,
                context={"request": request}
            ).data
        )
