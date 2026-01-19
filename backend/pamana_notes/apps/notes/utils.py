from django.db.models import Q
from .models import Note
from django.core.mail import send_mail
from django.conf import settings

def get_visible_notes(user):
    if user.is_authenticated:
        return Note.objects.filter(
            Q(visibility="public") |
            Q(visibility="school") |
            Q(visibility="course", course__students=user),
            is_removed=False
        ).distinct()
    else:
        return Note.objects.filter(
            visibility="public",
            is_removed=False
        )

def send_approval_email(note):
    send_mail(
        subject="Your note has been approved",
        message=(
            f"Hi {note.uploader.school_id},\n\n"
            f"Your note '{note.title}' has been approved and is now visible."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[note.uploader.email],
        fail_silently=True,
    )


def send_rejection_email(note):
    send_mail(
        subject="Your note was rejected",
        message=(
            f"Hi {note.uploader.school_id},\n\n"
            f"Your note '{note.title}' was rejected.\n\n"
            f"Reason:\n{note.rejection_reason}"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[note.uploader.email],
        fail_silently=True,
    )