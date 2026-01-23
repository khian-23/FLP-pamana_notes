from rest_framework.views import APIView
from rest_framework.response import Response
from apps.notes.api.views import IsReviewer

from apps.notes.models import Note
from apps.notes.api.serializers import NoteSerializer


class ModeratedNotesAPIView(APIView):
    permission_classes = [IsReviewer]

    def get(self, request):
        notes = Note.objects.filter(
            status__in=["approved", "rejected"]
        ).order_by("-updated_at")

        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
