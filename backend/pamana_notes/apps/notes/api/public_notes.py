from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class PublicNotesAPIView(APIView):
    authentication_classes = []  # 🚫 no auth
    permission_classes = []      # 🚫 no login required

    def get(self, request):
        notes_qs = (
            Note.objects.filter(
                is_deleted=False,
                is_approved=True,
                visibility="public",
            )
            .select_related(
                "uploader",
                "subject",
                "subject__course",
            )
            .order_by("-uploaded_at")
        )

        return Response({
            "count": notes_qs.count(),
            "notes": AdminNoteSerializer(
                notes_qs,
                many=True,
                context={"request": request}
            ).data,
        })
