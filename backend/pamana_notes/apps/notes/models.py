from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db.models import Avg
import os

User = get_user_model()

# --------------------
# File validation
# --------------------
def validate_file_type(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = [".pdf", ".docx", ".pptx"]
    if ext not in valid_extensions:
        raise ValidationError(
            "Unsupported file extension. Allowed: PDF, DOCX, PPTX."
        )


# --------------------
# Note Model
# --------------------
class Note(models.Model):
    VISIBILITY_PUBLIC = "public"
    VISIBILITY_SCHOOL = "school"
    VISIBILITY_COURSE = "course"

    VISIBILITY_CHOICES = [
        (VISIBILITY_PUBLIC, "Public"),
        (VISIBILITY_SCHOOL, "School"),
        (VISIBILITY_COURSE, "Course Only"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    content = models.TextField(blank=True)
    file = models.FileField(upload_to="files/", blank=True, null=True)


    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_notes",
    )

    subject = models.ForeignKey(
        "subjects.Subject",
        on_delete=models.CASCADE,
        related_name="notes",
    )

    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default=VISIBILITY_PUBLIC,
    )

    # Moderation
    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.uploader.school_id}"

    def average_rating(self):
        return self.ratings.aggregate(avg=Avg("value"))["avg"] or 0

    def can_view(self, user):
        if self.is_deleted:
            return False

        if self.is_approved:
            if self.visibility == self.VISIBILITY_PUBLIC:
                return True

            if not user.is_authenticated:
                return False

            return user == self.uploader or user.is_staff

        if not user.is_authenticated:
            return False

        return user == self.uploader or user.is_staff


# --------------------
# Bookmark Model
# --------------------
class Bookmark(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookmarks"
    )
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="bookmarked_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "note")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.school_id} bookmarked {self.note.title}"


# --------------------
# Rating Model
# --------------------
class Rating(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="ratings",
    )
    value = models.PositiveSmallIntegerField()  # 1–5
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "note")

    def __str__(self):
        return f"{self.note.title} rated {self.value} by {self.user.school_id}"


# --------------------
# Comment Model
# --------------------
class Comment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="note_comments",
    )
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="replies",
    )

    def __str__(self):
        return f"{self.user.school_id} on {self.note.title}"


# --------------------
# Comment Report Model
# --------------------
class CommentReport(models.Model):
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comment_reports",
    )
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("comment", "reported_by")

    def __str__(self):
        return f"Report by {self.reported_by.school_id} on comment {self.comment.id}"


# --------------------
# Note Action (Timeline / Moderation)
# --------------------
class NoteAction(models.Model):
    ACTION_CHOICES = (
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("resubmitted", "Resubmitted"),
    )

    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="actions",
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.note.title} - {self.action}"

class NoteLike(models.Model):
    note = models.ForeignKey(
        "Note",
        on_delete=models.CASCADE,
        related_name="likes"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("note", "user")


class NoteSave(models.Model):
    note = models.ForeignKey(
        "Note",
        on_delete=models.CASCADE,
        related_name="saves"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("note", "user")