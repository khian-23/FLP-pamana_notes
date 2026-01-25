from rest_framework.views import APIView
from rest_framework.response import Response
from apps.notes.api.views import IsReviewer

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class ModeratedNotesAPIView(APIView):
    permission_classes = [IsReviewer]

    def get(self, request):
        notes = Note.objects.filter(
            is_approved=True
        ).union(
            Note.objects.filter(is_rejected=True)
        ).order_by("-updated_at")

        serializer = AdminNoteSerializer(
            notes,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)
