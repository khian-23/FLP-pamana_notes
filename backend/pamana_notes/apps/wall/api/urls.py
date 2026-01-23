from django.urls import path

from .views import (
    # POSTS
    FreedomPostListCreateAPIView,
    FreedomPostDeleteAPIView,
    FreedomPostLikeAPIView,

    # COMMENTS
    FreedomCommentCreateAPIView,
    FreedomCommentLikeAPIView,
    FreedomCommentDeleteAPIView,
)

urlpatterns = [
    # ============================
    # FREEDOM POSTS
    # ============================
    path(
        "posts/",
        FreedomPostListCreateAPIView.as_view(),
        name="freedom-post-list-create",
    ),
    path(
        "posts/<int:post_id>/delete/",
        FreedomPostDeleteAPIView.as_view(),
        name="freedom-post-delete",
    ),
    path(
        "posts/<int:post_id>/like/",
        FreedomPostLikeAPIView.as_view(),
        name="freedom-post-like",
    ),

    # ============================
    # COMMENTS / THREADS
    # ============================
    path(
        "comments/",
        FreedomCommentCreateAPIView.as_view(),
        name="freedom-comment-create",
    ),
    path(
        "comments/<int:comment_id>/like/",
        FreedomCommentLikeAPIView.as_view(),
        name="freedom-comment-like",
    ),
    path(
        "comments/<int:comment_id>/delete/",
        FreedomCommentDeleteAPIView.as_view(),
        name="freedom-comment-delete",
    ),
]
