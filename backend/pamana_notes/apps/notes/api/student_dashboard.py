from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from apps.notes.models import Note
from apps.notes.api.serializers import AdminNoteSerializer


class StudentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        notes_qs = (
            Note.objects.filter(
                is_deleted=False,
                is_approved=True,
            )
            .filter(
                Q(visibility="public") |
                Q(visibility="school") |
                (
                    Q(visibility="course") &
                    (
                        Q(subject__course=user.course) |
                        Q(subject__course__isnull=True)
                    )
                )
            )
            .select_related(
                "uploader",
                "subject",
                "subject__course",
            )
            .order_by("-uploaded_at")
        )

        data = {
            "my_notes": Note.objects.filter(
                uploader=user, is_deleted=False
            ).count(),
            "approved": Note.objects.filter(
                uploader=user, is_approved=True, is_deleted=False
            ).count(),
            "pending": Note.objects.filter(
                uploader=user,
                is_approved=False,
                is_rejected=False,
                is_deleted=False
            ).count(),
            "rejected": Note.objects.filter(
                uploader=user, is_rejected=True, is_deleted=False
            ).count(),
            "notes": AdminNoteSerializer(
                notes_qs,
                many=True,
                context={"request": request}
            ).data,
        }

        return Response(data)
