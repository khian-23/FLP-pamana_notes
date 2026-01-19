from django.db import models
from django.conf import settings


class FreedomPost(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def top_comments(self):
        return self.comments.filter(
            parent__isnull=True
        ).order_by("-likes")[:3]

    @property
    def rendered_content(self):
        from apps.wall.utils.markdown import render_markdown
        return render_markdown(self.content)

class Comment(models.Model):
    post = models.ForeignKey(
        FreedomPost,
        related_name="comments",
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="replies",
        on_delete=models.CASCADE
    )

    likes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)




class CommentReport(models.Model):
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="wall_reports"
    )
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wall_comment_reports"
    )
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Comment Report"
        verbose_name_plural = "Comment Reports"
        unique_together = ("comment", "reported_by")

    def __str__(self):
        return f"Report by {self.reported_by.school_id} on comment {self.comment.id}"

class PostLike(models.Model):
    post = models.ForeignKey(
        FreedomPost,
        related_name="likes",
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "user")