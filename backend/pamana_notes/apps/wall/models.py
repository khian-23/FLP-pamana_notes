from django.db import models
from django.conf import settings


# ======================================================
# FREEDOM POST
# ======================================================
class FreedomPost(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freedom_posts",
    )
    content = models.TextField()
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Post by {self.user.school_id} at {self.created_at}"

    @property
    def rendered_content(self):
        from apps.wall.utils.markdown import render_markdown
        return render_markdown(self.content)


# ======================================================
# FREEDOM COMMENT (THREAD SUPPORT)
# ======================================================
class FreedomComment(models.Model):
    post = models.ForeignKey(
        FreedomPost,
        related_name="comments",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freedom_comments",
    )
    content = models.TextField()
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="replies",
        on_delete=models.CASCADE,
    )
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.user.school_id} on post {self.post.id}"


# ======================================================
# POST LIKE (ONE PER USER)
# ======================================================
class FreedomPostLike(models.Model):
    post = models.ForeignKey(
        FreedomPost,
        related_name="likes",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freedom_post_likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "user")

    def __str__(self):
        return f"{self.user.school_id} liked post {self.post.id}"


# ======================================================
# COMMENT LIKE (THREAD LIKE)
# ======================================================
class FreedomCommentLike(models.Model):
    comment = models.ForeignKey(
        FreedomComment,
        related_name="likes",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freedom_comment_likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("comment", "user")

    def __str__(self):
        return f"{self.user.school_id} liked comment {self.comment.id}"
