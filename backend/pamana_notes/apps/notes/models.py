from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Avg
import os


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

    # Basic magic header validation (prevents trivial spoofing)
    try:
        header = value.read(8)
        value.seek(0)
    except Exception:
        raise ValidationError("Unable to read uploaded file.")

    if ext == ".pdf" and not header.startswith(b"%PDF-"):
        raise ValidationError("Invalid PDF file.")
    if ext in [".docx", ".pptx"] and not header.startswith(b"PK"):
        raise ValidationError("Invalid Office file.")


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
    downloads = models.PositiveIntegerField(default=0)
    title = models.CharField(max_length=255)
    description = models.TextField()
    content = models.TextField(blank=True)
    file = models.FileField(
        upload_to="files/",
        blank=True,
        null=True,
        validators=[validate_file_type],
    )

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
            if user.is_authenticated and (user == self.uploader or user.is_staff):
                return True
            if self.visibility == self.VISIBILITY_PUBLIC:
                return True
            if not user.is_authenticated:
                return False
            if self.visibility == self.VISIBILITY_SCHOOL:
                return True
            if self.visibility == self.VISIBILITY_COURSE:
                return (
                    user.course is not None
                    and self.subject.course is not None
                    and user.course_id == self.subject.course_id
                )
            return False

        if not user.is_authenticated:
            return False

        return user == self.uploader or user.is_staff


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

    class Meta:
        ordering = ["created_at"]

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


# --------------------
# Like & Save Models
# --------------------
class NoteLike(models.Model):
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("note", "user")


class NoteSave(models.Model):
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="saves",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("note", "user")
