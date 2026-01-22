from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class StudentSavedNotesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notes = (
            Note.objects.filter(
                saves__user=request.user,  # ✅ CORRECT
                is_deleted=False,
                is_approved=True,
            )
            .select_related(
                "uploader",
                "subject",
                "subject__course",
            )
            .distinct()
            .order_by("-uploaded_at")
        )

        return Response({
            "count": notes.count(),
            "notes": AdminNoteSerializer(
                notes,
                many=True,
                context={"request": request}
            ).data,
        })
