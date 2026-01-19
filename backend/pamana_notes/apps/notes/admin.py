from django.contrib import admin, messages
from django.conf import settings
from django.core.mail import send_mail

from .models import Note, NoteAction


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "uploader",
        "subject",
        "get_course",
        "visibility",
        "is_approved",
        "is_rejected",
        "uploaded_at",
    )

    list_filter = (
        "visibility",
        "is_approved",
        "is_rejected",
        "subject",
        "uploaded_at",
    )

    search_fields = (
        "title",
        "description",
        "uploader__school_id",
    )

    readonly_fields = ("uploaded_at",)

    fieldsets = (
        (
            "Note Information",
            {
                "fields": (
                    "title",
                    "description",
                    "content",
                    "file",
                    "subject",
                    "visibility",
                )
            },
        ),
        ("Uploader", {"fields": ("uploader",)}),
        (
            "Moderation",
            {
                "fields": (
                    "is_approved",
                    "is_rejected",
                    "rejection_reason",
                )
            },
        ),
        ("Timestamps", {"fields": ("uploaded_at",)}),
    )

    actions = ("approve_notes", "reject_notes")

    # -------------------------------------------------
    # Display helpers
    # -------------------------------------------------
    def get_course(self, obj):
        return obj.subject.course.name if obj.subject and obj.subject.course else "-"

    get_course.short_description = "Course"

    # -------------------------------------------------
    # Permissions
    # -------------------------------------------------
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_staff or request.user.is_superuser:
            return qs
        return qs.filter(uploader=request.user, is_deleted=False)

    def get_readonly_fields(self, request, obj=None):
        if not request.user.is_staff:
            return (
                "uploader",
                "visibility",
                "is_approved",
                "is_rejected",
                "rejection_reason",
            )
        return self.readonly_fields

    # -------------------------------------------------
    # Save hook (emails + timeline)
    # -------------------------------------------------
    def save_model(self, request, obj, form, change):
        prev_approved = None
        prev_rejected = None

        if change:
            prev = Note.objects.get(pk=obj.pk)
            prev_approved = prev.is_approved
            prev_rejected = prev.is_rejected
        else:
            obj.uploader = request.user
            obj.is_approved = False
            obj.is_rejected = False

        super().save_model(request, obj, form, change)

        # ---- APPROVED ----
        if obj.is_approved and not prev_approved:
            NoteAction.objects.create(
                note=obj,
                action="approved",
                actor=request.user,
            )
            send_mail(
                subject="Your note was approved",
                message=f"Your note '{obj.title}' is now visible.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[obj.uploader.email],
                fail_silently=True,
            )

        # ---- REJECTED ----
        if obj.is_rejected and not prev_rejected:
            NoteAction.objects.create(
                note=obj,
                action="rejected",
                actor=request.user,
                reason=obj.rejection_reason,
            )
            send_mail(
                subject="Your note was rejected",
                message=f"Reason:\n{obj.rejection_reason}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[obj.uploader.email],
                fail_silently=True,
            )

    # -------------------------------------------------
    # Admin Actions
    # -------------------------------------------------
    @admin.action(description="Approve selected notes")
    def approve_notes(self, request, queryset):
        count = 0
        for note in queryset:
            if not note.is_approved:
                note.is_approved = True
                note.is_rejected = False
                note.rejection_reason = ""
                note.save()

                NoteAction.objects.create(
                    note=note,
                    action="approved",
                    actor=request.user,
                )
                count += 1

        messages.success(request, f"{count} note(s) approved.")

    @admin.action(description="Reject selected notes (requires reason)")
    def reject_notes(self, request, queryset):
        for note in queryset:
            if not note.rejection_reason:
                messages.error(
                    request,
                    f"Note '{note.title}' must have a rejection reason before rejecting."
                )
                return

            if not note.is_rejected:
                note.is_approved = False
                note.is_rejected = True
                note.save()

                NoteAction.objects.create(
                    note=note,
                    action="rejected",
                    actor=request.user,
                    reason=note.rejection_reason,
                )

        messages.success(request, "Selected notes rejected.")
