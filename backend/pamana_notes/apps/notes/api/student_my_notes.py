from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class StudentMyNotesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notes = Note.objects.filter(
            uploader=request.user,
            is_deleted=False
        ).order_by("-uploaded_at")

        return Response(
            AdminNoteSerializer(
                notes,
                many=True,
                context={"request": request}
            ).data
        )
