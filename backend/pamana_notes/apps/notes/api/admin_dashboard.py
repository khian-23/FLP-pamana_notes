from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count
from django.db.models.functions import TruncDate

from apps.notes.models import Note
from django.contrib.auth import get_user_model

User = get_user_model()


class AdminDashboardStatsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # ======================
        # KPI STATS
        # ======================
        stats = {
            "total_users": User.objects.count(),
            "total_notes": Note.objects.filter(is_deleted=False).count(),

            # pending = not approved, not rejected, not deleted
            "pending_notes": Note.objects.filter(
                is_approved=False,
                is_rejected=False,
                is_deleted=False,
            ).count(),

            "approved_notes": Note.objects.filter(
                is_approved=True,
                is_deleted=False,
            ).count(),

            "rejected_notes": Note.objects.filter(
                is_rejected=True
            ).count(),
        }

        # ======================
        # UPLOADS PER DAY
        # ======================
        uploads_per_day = (
            Note.objects
            .filter(is_deleted=False)
            .annotate(day=TruncDate("uploaded_at"))
            .values("day")
            .annotate(notes=Count("id"))
            .order_by("day")
        )

        uploads_per_day = [
            {"day": str(row["day"]), "notes": row["notes"]}
            for row in uploads_per_day
            if row["day"] is not None
        ]

        # ======================
        # UPLOADS BY SUBJECT
        # ======================
        uploads_by_subject = (
            Note.objects
            .filter(is_deleted=False)
            .values("subject__name")
            .annotate(notes=Count("id"))
            .order_by("-notes")
        )

        uploads_by_subject = [
            {
                "subject": row["subject__name"] or "Uncategorized",
                "notes": row["notes"]
            }
            for row in uploads_by_subject
        ]

        return Response({
            "stats": stats,
            "uploads_per_day": uploads_per_day,
            "uploads_by_subject": uploads_by_subject,
        })
