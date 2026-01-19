from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class ModeratedNotesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        notes = Note.objects.filter(status__in=["approved", "rejected"]) \
            .select_related("author", "subject") \
            .order_by("-updated_at")

        serializer = AdminNoteSerializer(notes, many=True)
        return Response(serializer.data)
