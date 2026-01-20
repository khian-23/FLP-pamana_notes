from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status

from django.contrib.auth import get_user_model
from django.db.models.functions import TruncDate
from django.db.models import Count

from apps.notes.models import Note
from .serializers import AdminNoteSerializer

User = get_user_model()


class PendingNotesAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        notes = Note.objects.filter(
            is_approved=False,
            is_rejected=False,
            is_deleted=False,
        ).order_by("-uploaded_at")

        serializer = AdminNoteSerializer(
            notes,
            many=True,
            context={"request": request},
)
        return Response(serializer.data)


class ModeratedNotesAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        notes = (
            Note.objects.filter(is_deleted=False, is_approved=True)
            | Note.objects.filter(is_deleted=False, is_rejected=True)
        ).order_by("-uploaded_at")

        serializer = AdminNoteSerializer(
            notes,
            many=True,
            context={"request": request},
)
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_note(request, pk):
    try:
        note = Note.objects.get(pk=pk)

        note.is_approved = True
        note.is_rejected = False
        note.rejection_reason = ""
        note.save()

        return Response(
            {"message": "Note approved successfully"},
            status=status.HTTP_200_OK,
        )

    except Note.DoesNotExist:
        return Response(
            {"error": "Note not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def reject_note(request, pk):
    try:
        note = Note.objects.get(pk=pk)

        note.is_approved = False
        note.is_rejected = True
        note.rejection_reason = request.data.get(
            "reason", "Rejected by admin"
        )
        note.save()

        return Response(
            {"message": "Note rejected successfully"},
            status=status.HTTP_200_OK,
        )

    except Note.DoesNotExist:
        return Response(
            {"error": "Note not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


class AdminDashboardAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # ===== KPI STATS =====
        stats = {
            "total_users": User.objects.count(),
            "total_notes": Note.objects.filter(is_deleted=False).count(),
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
                is_rejected=True,
                is_deleted=False,
            ).count(),
        }

        # ===== UPLOADS PER DAY =====
        uploads_per_day_qs = (
            Note.objects.filter(
                is_deleted=False,
                is_approved=True,
            )
            .annotate(day=TruncDate("uploaded_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        uploads_per_day = [
            {"day": str(row["day"]), "notes": row["count"]}
            for row in uploads_per_day_qs
        ]

        # ===== UPLOADS BY SUBJECT =====
        uploads_by_subject_qs = (
            Note.objects.filter(is_deleted=False)
            .values("subject__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        uploads_by_subject = [
            {"subject": row["subject__name"], "notes": row["count"]}
            for row in uploads_by_subject_qs
        ]

        return Response({
            "stats": stats,
            "uploads_per_day": uploads_per_day,
            "uploads_by_subject": uploads_by_subject,
        })

@api_view(["POST"])
@permission_classes([IsAdminUser])
def bulk_reject_notes(request):
    ids = request.data.get("ids", [])
    reason = request.data.get("reason", "Rejected by admin")

    notes = Note.objects.filter(id__in=ids)

    for note in notes:
        note.is_approved = False
        note.is_rejected = True
        note.rejection_reason = reason
        note.save()

    return Response({"rejected": notes.count()})