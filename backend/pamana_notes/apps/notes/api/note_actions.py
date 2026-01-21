from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.notes.models import Note, NoteLike, NoteSave, Comment
from apps.notes.api.serializers import CommentSerializer


class ToggleLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        note = get_object_or_404(Note, pk=pk)
        like, created = NoteLike.objects.get_or_create(
            user=request.user, note=note
        )

        if not created:
            like.delete()

        return Response({"liked": created})


class ToggleSaveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        note = get_object_or_404(Note, pk=pk)
        save, created = NoteSave.objects.get_or_create(
            user=request.user, note=note
        )

        if not created:
            save.delete()

        return Response({"saved": created})


class CommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        comments = Comment.objects.filter(
            note_id=pk,
            parent__isnull=True
        ).order_by("created_at")

        return Response(
            CommentSerializer(comments, many=True).data
        )

    def post(self, request, pk):
        note = get_object_or_404(Note, pk=pk)

        Comment.objects.create(
            user=request.user,
            note=note,
            content=request.data.get("content"),
            parent_id=request.data.get("parent"),
        )

        return Response({"success": True})
