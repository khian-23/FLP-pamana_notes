from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from django.db.models import Count, Q

from apps.subjects.models import Subject


class PublicSubjectListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        subjects = (
            Subject.objects
            .filter(
                notes__visibility="public",
                notes__is_approved=True,
                notes__is_deleted=False,
            )
            .annotate(
                public_notes_count=Count(
                    "notes",
                    filter=Q(
                        notes__visibility="public",
                        notes__is_approved=True,
                        notes__is_deleted=False,
                    ),
                )
            )
            .values(
                "id",
                "name",
                "public_notes_count",
            )
            .order_by("name")
        )

        return Response(subjects)