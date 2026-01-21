from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class StudentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        notes_qs = Note.objects.filter(
            is_deleted=False,
            visibility__in=["public", "school", "course"],
        ).exclude(is_rejected=True)

        data = {
            "my_notes": Note.objects.filter(uploader=user, is_deleted=False).count(),
            "approved": Note.objects.filter(uploader=user, is_approved=True, is_deleted=False).count(),
            "pending": Note.objects.filter(
                uploader=user, is_approved=False, is_rejected=False, is_deleted=False
            ).count(),
            "rejected": Note.objects.filter(uploader=user, is_rejected=True, is_deleted=False).count(),
            "notes": AdminNoteSerializer(
                notes_qs,
                many=True,
                context={"request": request}
            ).data,
        }

        return Response({
            "count": notes_qs.count(),
            "notes": list(notes_qs.values("id", "title", "visibility"))
        })
