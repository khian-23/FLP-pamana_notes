from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Note
from .serializers import NoteSerializer


class IsAdminUserCustom(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notes_list_api(request):
    user = request.user

    # Admin: see everything
    if user.is_staff or user.is_superuser:
        queryset = Note.objects.filter(is_deleted=False)

    # Moderator: see pending only
    elif user.groups.filter(name="moderator").exists():
        queryset = Note.objects.filter(
            is_approved=False,
            is_rejected=False,
            is_deleted=False,
        )

    # Normal user: own notes + approved notes
    else:
        queryset = Note.objects.filter(
            is_deleted=False
        ).filter(
            Q(uploader=user) | Q(is_approved=True)
        )

    serializer = NoteSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def pending_notes_api(request):
    notes = Note.objects.filter(is_approved=False, is_rejected=False)
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def approve_note_api(request, pk):
    note = get_object_or_404(Note, pk=pk)
    note.is_approved = True
    note.is_rejected = False
    note.rejection_reason = ""
    note.save()
    return Response({"message": "Note approved"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def reject_note_api(request, pk):
    note = get_object_or_404(Note, pk=pk)
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
