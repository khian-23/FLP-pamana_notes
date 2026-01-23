from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Note
from .serializers import NoteSerializer


# ======================================================
# REVIEWER PERMISSION (ADMIN + MODERATOR)
# ======================================================
class IsReviewer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ["admin", "moderator"]
        )


# ======================================================
# NOTES LIST
# ======================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notes_list_api(request):
    user = request.user

    # ADMIN: see everything
    if user.role == "admin":
        queryset = Note.objects.filter(is_deleted=False)

    # MODERATOR: pending notes (course-scoped)
    elif user.role == "moderator":
        queryset = Note.objects.filter(
            is_deleted=False,
            is_approved=False,
            is_rejected=False,
        ).filter(
            Q(subject__course=user.course) |
            Q(subject__course__isnull=True)
        )

    # STUDENT: own notes + approved notes
    else:
        queryset = Note.objects.filter(
            is_deleted=False
        ).filter(
            Q(uploader=user) | Q(is_approved=True)
        )

    serializer = NoteSerializer(queryset, many=True)
    return Response(serializer.data)


# ======================================================
# REVIEWER — PENDING NOTES (COURSE-SCOPED)
# ======================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsReviewer])
def pending_notes_api(request):
    user = request.user

    notes = Note.objects.filter(
        is_deleted=False,
        is_approved=False,
        is_rejected=False,
    )

    # 🔒 Moderator: own course + general only
    if user.role == "moderator":
        notes = notes.filter(
            Q(subject__course=user.course) |
            Q(subject__course__isnull=True)
        )

    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


# ======================================================
# REVIEWER — APPROVE NOTE
# ======================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsReviewer])
def approve_note_api(request, pk):
    user = request.user

    note = get_object_or_404(
        Note,
        pk=pk,
        is_deleted=False,
    )

    # 🔒 Moderator cannot approve outside scope
    if user.role == "moderator":
        if note.subject and note.subject.course and note.subject.course != user.course:
            return Response(
                {"detail": "Not allowed to approve notes from other courses."},
                status=status.HTTP_403_FORBIDDEN,
            )

    note.is_approved = True
    note.is_rejected = False
    note.rejection_reason = ""
    note.save()

    return Response({"message": "Note approved"}, status=status.HTTP_200_OK)


# ======================================================
# REVIEWER — REJECT NOTE
# ======================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsReviewer])
def reject_note_api(request, pk):
    user = request.user

    note = get_object_or_404(
        Note,
        pk=pk,
        is_deleted=False,
    )

    # 🔒 Moderator cannot reject outside scope
    if user.role == "moderator":
        if note.subject and note.subject.course and note.subject.course != user.course:
            return Response(
                {"detail": "Not allowed to reject notes from other courses."},
                status=status.HTTP_403_FORBIDDEN,
            )

    reason = request.data.get("reason", "").strip()
    if not reason:
        return Response(
            {"error": "Rejection reason is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    note.is_rejected = True
    note.is_approved = False
    note.rejection_reason = reason
    note.save()

    return Response({"message": "Note rejected"}, status=status.HTTP_200_OK)
