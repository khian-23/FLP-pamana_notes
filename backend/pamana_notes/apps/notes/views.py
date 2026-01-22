import json
import os

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import login
from django.contrib import messages
from django.http import FileResponse, JsonResponse
from django.urls import reverse
from django.db.models import Q
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.exceptions import PermissionDenied
from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpResponseForbidden
from django.db.models import Count
from django.db.models import Prefetch
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.accounts.forms import CustomUserCreationForm
from apps.subjects.models import Course
from .models import Note, Bookmark, Rating, Comment
from .forms import NoteForm, CommentForm


# =====================================================
# Helpers
# =====================================================

def is_admin(user):
    return user.is_staff or user.is_superuser


def visible_notes(user):
    qs = Note.objects.filter(is_deleted=False, is_approved=True)

    if not user.is_authenticated:
        return qs.order_by("-uploaded_at")

    if user.is_staff or user.is_superuser:
        return Note.objects.filter(is_deleted=False).order_by("-uploaded_at")

    return qs.order_by("-uploaded_at")


# =====================================================
# Notes List
# =====================================================

def notes_list(request):
    query = request.GET.get("q", "")
    course_id = request.GET.get("course")

    notes = visible_notes(request.user)

    if query:
        notes = notes.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(content__icontains=query)
        )

    if course_id:
        notes = notes.filter(subject__course_id=course_id)

    paginator = Paginator(notes, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    saved_notes = (
        Bookmark.objects.filter(user=request.user)
        .values_list("note_id", flat=True)
        if request.user.is_authenticated else []
    )

    return render(request, "notes/notes_list.html", {
        "page_obj": page_obj,
        "query": query,
        "course_id": course_id,
        "courses": Course.objects.all(),
        "saved_notes": saved_notes,
    })


# =====================================================
# Upload Note
# =====================================================

@login_required
def note_upload(request):
    if request.method == "POST":
        form = NoteForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            note = form.save(commit=False)
            note.uploader = request.user
            note.is_approved = False
            note.save()
            messages.success(request, "Note submitted for approval.")
            return redirect("notes:my_notes")
    else:
        form = NoteForm(user=request.user)

    return render(request, "notes/note_upload.html", {"form": form})


# =====================================================
# Note Detail
# =====================================================
def note_detail(request, pk):
    note = get_object_or_404(Note, pk=pk, is_deleted=False)

    if not note.can_view(request.user):
        raise PermissionDenied

    # Top-level comments + replies
    comments = (
        Comment.objects
        .filter(note=note, parent__isnull=True)
        .select_related("user")
        .prefetch_related("replies__user")
        .order_by("-created_at")
    )

    # User rating
    user_rating = 0
    if request.user.is_authenticated:
        user_rating = (
            Rating.objects
            .filter(note=note, user=request.user)
            .values_list("value", flat=True)
            .first()
        ) or 0

    # ⭐ Rating breakdown (INLINE, no helper)
    rating_counts = (
        Rating.objects
        .filter(note=note)
        .values("value")
        .annotate(count=Count("id"))
    )

    counts_map = {row["value"]: row["count"] for row in rating_counts}
    total = sum(counts_map.values())

    rating_rows = []
    for star in range(5, 0, -1):
        count = counts_map.get(star, 0)
        percent = (count / total * 100) if total > 0 else 0
        rating_rows.append({
            "star": star,
            "count": count,
            "percent": percent,
        })

    # Comment submit (new or reply)
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseForbidden("Login required")

        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.note = note
            comment.user = request.user

            parent_id = request.POST.get("parent_id")
            if parent_id:
                comment.parent = Comment.objects.get(id=parent_id)

            comment.save()
            return redirect("notes:note_detail", pk=note.pk)
    else:
        form = CommentForm()

    is_saved = False
    if request.user.is_authenticated:
        is_saved = Bookmark.objects.filter(
            user=request.user,
            note=note
        ).exists()

    return render(request, "notes/note_detail.html", {
        "note": note,
        "comments": comments,
        "form": form,
        "user_rating": user_rating,
        "avg_rating": note.average_rating(),
        "rating_rows": rating_rows,
        "is_saved": is_saved,
    })

# =====================================================
# My Notes
# =====================================================

@login_required
def my_notes(request):
    notes = Note.objects.filter(
        uploader=request.user,
        is_deleted=False
    ).order_by("-uploaded_at")

    return render(request, "notes/my_notes.html", {"notes": notes})


# =====================================================
# Update Note
# =====================================================

@login_required
def note_update(request, pk):
    note = get_object_or_404(Note, pk=pk, uploader=request.user)

    if request.method == "POST":
        form = NoteForm(request.POST, request.FILES, instance=note, user=request.user)
        if form.is_valid():
            note = form.save(commit=False)
            note.is_approved = False
            note.save()
            messages.success(request, "Note updated and resubmitted for approval.")
            return redirect("notes:my_notes")
    else:
        form = NoteForm(instance=note, user=request.user)

    return render(request, "notes/note_form.html", {"form": form, "note": note})


# =====================================================
# Delete Note (Soft Delete)
# =====================================================

@login_required
def note_delete(request, pk):
    note = get_object_or_404(Note, pk=pk, uploader=request.user)

    if request.method == "POST":
        note.is_deleted = True
        note.save()
        messages.success(request, "Note deleted.")
        return redirect("notes:my_notes")

    return render(request, "notes/note_confirm_delete.html", {"note": note})


# =====================================================
# Bookmark Toggle
# =====================================================
@login_required
def toggle_save_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)

    bookmark, created = Bookmark.objects.get_or_create(
        user=request.user,
        note=note
    )

    if not created:
        bookmark.delete()

    return redirect(request.META.get("HTTP_REFERER", "notes:note_list"))

# =====================================================
# Rate Note
# =====================================================

@login_required
def rate_note(request, pk):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    note = get_object_or_404(Note, pk=pk, is_deleted=False)

    if not note.can_view(request.user):
        return JsonResponse({"error": "Permission denied"}, status=403)

    # 🚫 Prevent rating own note
    if note.uploader == request.user:
        return JsonResponse(
            {"error": "You cannot rate your own note."},
            status=403
        )

    data = json.loads(request.body)
    value = int(data.get("value", 0))

    if value not in [1, 2, 3, 4, 5]:
        return JsonResponse({"error": "Invalid rating"}, status=400)

    rating, _ = Rating.objects.update_or_create(
        note=note,
        user=request.user,
        defaults={"value": value}
    )

    return JsonResponse({
        "success": True,
        "avg_rating": round(note.average_rating(), 1),
        "user_rating": rating.value,
    })



# =====================================================
# Download Note
# =====================================================

@login_required
def download_note(request, pk):
    note = get_object_or_404(Note, pk=pk, is_deleted=False)

    if not note.can_view(request.user):
        raise PermissionDenied

    if not note.file:
        messages.error(request, "No file attached.")
        return redirect("notes:note_detail", pk=pk)

    return FileResponse(
        note.file.open("rb"),
        as_attachment=True,
        filename=os.path.basename(note.file.name),
    )


# =====================================================
# Saved Notes
# =====================================================

@login_required
def saved_notes_list(request):
    notes = Note.objects.filter(
        bookmarked_by__user=request.user,
        is_approved=True,
        is_deleted=False
    ).order_by("-uploaded_at")

    paginator = Paginator(notes, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(request, "notes/saved_notes.html", {"page_obj": page_obj})


# =====================================================
# Admin: Pending / Approve / Reject
# =====================================================

@login_required
@user_passes_test(is_admin)
def pending_notes(request):
    notes = Note.objects.filter(
        is_approved=False,
        is_deleted=False
    ).order_by("-uploaded_at")

    paginator = Paginator(notes, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(request, "notes/pending_notes.html", {"page_obj": page_obj})


@login_required
@user_passes_test(is_admin)
@require_POST
def approve_note(request, pk):
    note = get_object_or_404(Note, pk=pk, is_deleted=False)
    note.is_approved = True
    note.is_rejected = False
    note.save()
    return JsonResponse({"success": True})


@login_required
@user_passes_test(is_admin)
@require_POST
def reject_note(request, pk):
    note = get_object_or_404(Note, pk=pk, is_deleted=False)

    data = json.loads(request.body)
    reason = data.get("reason", "").strip()

    note.is_approved = False
    note.is_rejected = True
    note.rejection_reason = reason
    note.save()

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

    return JsonResponse({"success": True})


# =====================================================
# Comments
# =====================================================

@login_required
def add_comment(request, pk):
    note = get_object_or_404(Note, pk=pk)

    if not note.can_view(request.user):
        raise PermissionDenied

    if request.method == "POST":
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.note = note
            comment.user = request.user
            comment.save()

    return redirect("notes:note_detail", pk=pk)

@login_required
def my_notes(request):
    notes = (
        Note.objects
        .filter(uploader=request.user, is_deleted=False)
        .select_related("subject")
        .order_by("-uploaded_at")
    )

    return render(request, "notes/my_notes.html", {
        "notes": notes
    })


class ToggleLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, note_id):
        note = Note.objects.get(id=note_id)

        if request.user in note.likes.all():
            note.likes.remove(request.user)
            liked = False
        else:
            note.likes.add(request.user)
            liked = True

        return Response({
            "liked": liked,
            "likes_count": note.likes.count()
        })