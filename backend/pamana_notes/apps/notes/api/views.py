from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.generics import DestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth import get_user_model
from django.db.models.functions import TruncDate
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from apps.notes.models import Note, Comment
from .serializers import (
    AdminNoteSerializer,
    CommentSerializer,
    NoteUpdateSerializer,
)

User = get_user_model()


# ======================================================
# PERMISSIONS
# ======================================================
class IsReviewer(BasePermission):
    """
    Reviewer = Admin or Moderator (Faculty)
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["admin", "moderator"]
        )


# ======================================================
# INTERNAL HELPER — COURSE-SCOPED QUERYSET
# ======================================================
def reviewer_notes_queryset(user):
    """
    Admin  -> all notes
    Moderator -> own course + general subjects only
    """
    qs = Note.objects.filter(is_deleted=False)

    if user.role == "admin":
        return qs

    # MODERATOR
    return qs.filter(
        Q(subject__course=user.course) |
        Q(subject__is_general=True)
    )


# ======================================================
# REVIEWER — PENDING NOTES
# ======================================================
class PendingNotesAPIView(APIView):
    permission_classes = [IsReviewer]

    def get(self, request):
        notes = (
            reviewer_notes_queryset(request.user)
            .filter(is_approved=False, is_rejected=False)
            .order_by("-uploaded_at")
        )

        return Response(
            AdminNoteSerializer(
                notes, many=True, context={"request": request}
            ).data
        )


# ======================================================
# REVIEWER — MODERATED NOTES
# ======================================================
class ModeratedNotesAPIView(APIView):
    permission_classes = [IsReviewer]

    def get(self, request):
        notes = (
            reviewer_notes_queryset(request.user)
            .filter(Q(is_approved=True) | Q(is_rejected=True))
            .order_by("-uploaded_at")
        )

        return Response(
            AdminNoteSerializer(
                notes, many=True, context={"request": request}
            ).data
        )


# ======================================================
# STUDENT — UPDATE NOTE
# ======================================================
class StudentNoteUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        note = get_object_or_404(
            Note,
            pk=pk,
            uploader=request.user,
            is_deleted=False,
        )

        serializer = NoteUpdateSerializer(
            note,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        note.is_approved = False
        note.is_rejected = False
        note.rejection_reason = ""
        note.save(
            update_fields=[
                "is_approved",
                "is_rejected",
                "rejection_reason",
            ]
        )

        return Response(
            AdminNoteSerializer(
                note, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )


# ======================================================
# REVIEWER — APPROVE / REJECT
# ======================================================
@api_view(["POST"])
@permission_classes([IsReviewer])
def approve_note(request, pk):
    note = get_object_or_404(
        reviewer_notes_queryset(request.user),
        pk=pk,
    )

    note.is_approved = True
    note.is_rejected = False
    note.rejection_reason = ""
    note.save(
        update_fields=[
            "is_approved",
            "is_rejected",
            "rejection_reason",
        ]
    )

    return Response({"message": "Note approved successfully"})


@api_view(["POST"])
@permission_classes([IsReviewer])
def reject_note(request, pk):
    note = get_object_or_404(
        reviewer_notes_queryset(request.user),
        pk=pk,
    )

    note.is_approved = False
    note.is_rejected = True
    note.rejection_reason = request.data.get(
        "reason", "Rejected by reviewer"
    )
    note.save(
        update_fields=[
            "is_approved",
            "is_rejected",
            "rejection_reason",
        ]
    )

    return Response({"message": "Note rejected successfully"})


# ======================================================
# ADMIN ONLY — DASHBOARD
# ======================================================
class AdminDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN,
            )

        stats = {
            "total_users": User.objects.count(),
            "total_notes": Note.objects.filter(is_deleted=False).count(),
            "pending_notes": Note.objects.filter(
                is_deleted=False,
                is_approved=False,
                is_rejected=False,
            ).count(),
            "approved_notes": Note.objects.filter(
                is_deleted=False,
                is_approved=True,
            ).count(),
            "rejected_notes": Note.objects.filter(
                is_deleted=False,
                is_rejected=True,
            ).count(),
        }

        uploads_per_day = (
            Note.objects.filter(is_deleted=False, is_approved=True)
            .annotate(day=TruncDate("uploaded_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        uploads_by_subject = (
            Note.objects.filter(is_deleted=False)
            .values("subject__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        return Response({
            "stats": stats,
            "uploads_per_day": uploads_per_day,
            "uploads_by_subject": uploads_by_subject,
        })


# ======================================================
# PUBLIC NOTES
# ======================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def public_notes_api(request):
    notes = Note.objects.filter(
        is_deleted=False,
        is_approved=True,
    ).order_by("-uploaded_at")

    return Response(
        AdminNoteSerializer(
            notes, many=True, context={"request": request}
        ).data
    )


# ======================================================
# COMMENTS
# ======================================================
class NoteCommentsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, note_id):
        comments = Comment.objects.filter(
            note_id=note_id
        ).order_by("-created_at")

        return Response({
            "comments": CommentSerializer(
                comments, many=True, context={"request": request}
            ).data
        })

    def post(self, request, note_id):
        comment = Comment.objects.create(
            note_id=note_id,
            user=request.user,
            content=request.data.get("content"),
        )
        return Response(
            CommentSerializer(
                comment, context={"request": request}
            ).data,
            status=201,
        )


class CommentDeleteAPIView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Comment.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
