from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.wall.models import (
    FreedomPost,
    FreedomComment,
    FreedomPostLike,
    FreedomCommentLike,
)
from .serializers import (
    FreedomPostSerializer,
    FreedomPostCreateSerializer,
    FreedomCommentSerializer,
    FreedomCommentCreateSerializer,
)


# ======================================================
# POSTS — LIST & CREATE
# ======================================================
class FreedomPostListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = (
            FreedomPost.objects
            .filter(is_deleted=False)
            .select_related("user", "user__profile")
        )

        serializer = FreedomPostSerializer(
            posts,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = FreedomPostCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        post = serializer.save()

        return Response(
            FreedomPostSerializer(
                post,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ======================================================
# POST — DELETE (OWNER ONLY)
# ======================================================
class FreedomPostDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, post_id):
        post = get_object_or_404(FreedomPost, id=post_id)

        if post.user != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN,
            )

        post.is_deleted = True
        post.save(update_fields=["is_deleted"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ======================================================
# POST — LIKE / UNLIKE
# ======================================================
class FreedomPostLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(
            FreedomPost,
            id=post_id,
            is_deleted=False,
        )

        like, created = FreedomPostLike.objects.get_or_create(
            post=post,
            user=request.user,
        )

        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        return Response({
            "liked": liked,
            "likes_count": post.likes.count(),
        })


# ======================================================
# COMMENT — CREATE (THREAD SUPPORT)
# ======================================================
class FreedomCommentCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FreedomCommentCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()

        return Response(
            FreedomCommentSerializer(
                comment,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ======================================================
# COMMENT — LIKE / UNLIKE
# ======================================================
class FreedomCommentLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        comment = get_object_or_404(
            FreedomComment,
            id=comment_id,
            is_deleted=False,
        )

        like, created = FreedomCommentLike.objects.get_or_create(
            comment=comment,
            user=request.user,
        )

        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        return Response({
            "liked": liked,
            "likes_count": comment.likes.count(),
        })


# ======================================================
# COMMENT — DELETE (OWNER ONLY)
# ======================================================
class FreedomCommentDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        comment = get_object_or_404(FreedomComment, id=comment_id)

        if comment.user != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN,
            )

        comment.is_deleted = True
        comment.save(update_fields=["is_deleted"])
        return Response(status=status.HTTP_204_NO_CONTENT)
