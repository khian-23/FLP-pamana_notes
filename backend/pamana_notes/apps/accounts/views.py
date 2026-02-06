from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from django.core.cache import cache

from .forms import (
    StudentUserCreationForm,
    SchoolIDAuthenticationForm,
    ProfileForm,
)
from .models import Profile
from apps.notes.models import Note


# ============================
# LOGIN (STUDENT + ADMIN)
# ============================
def login_view(request):
    ip = request.META.get("REMOTE_ADDR", "unknown")
    key = f"login:fail:{ip}"
    fails = cache.get(key, 0)
    if fails >= 10:
        messages.error(request, "Too many login attempts. Try again later.")
        return render(request, "accounts/login.html", {"form": SchoolIDAuthenticationForm()})

    if request.method == "POST":
        form = SchoolIDAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            cache.delete(key)
            messages.success(
                request, f"Welcome back, {user.school_id}!"
            )
            return redirect("core:home")
        else:
            cache.set(key, fails + 1, timeout=15 * 60)
            messages.error(
                request, "Invalid School ID or password."
            )
    else:
        form = SchoolIDAuthenticationForm()

    return render(
        request,
        "accounts/login.html",
        {"form": form},
    )


# ============================
# LOGOUT
# ============================
def logout_view(request):
    logout(request)
    messages.info(
        request, "You have successfully logged out."
    )
    return redirect("core:home")


# ============================
# STUDENT SIGNUP ONLY
# ============================
def signup(request):
    if request.method == "POST":
        form = StudentUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)

            next_url = (
                request.POST.get("next")
                or reverse("notes:note_list")
            )
            return redirect(next_url)
    else:
        form = StudentUserCreationForm()

    return render(
        request,
        "registration/signup.html",
        {"form": form},
    )


# ============================
# PROFILE VIEW
# ============================
@login_required
def profile_view(request):
    profile, _ = Profile.objects.get_or_create(
        user=request.user
    )

    saved_notes = (
        Note.objects.filter(
            saves__user=request.user,
            is_deleted=False,
            is_approved=True,
        )
        .select_related("uploader", "subject")
        .order_by("-uploaded_at")
    )

    if request.method == "POST":
        form = ProfileForm(
            request.POST,
            request.FILES,
            instance=profile,
        )
        if form.is_valid():
            form.save()
            messages.success(
                request, "Profile updated successfully."
            )
            return redirect("accounts:profile")
    else:
        form = ProfileForm(instance=profile)

    return render(
        request,
        "accounts/profile.html",
        {
            "form": form,
            "profile": profile,
            "saved_notes": saved_notes,
        },
    )


# ============================
# EDIT PROFILE (LEGACY)
# ============================
@login_required
def edit_profile(request):
    profile = request.user.profile

    if request.method == "POST":
        form = ProfileForm(
            request.POST,
            request.FILES,
            instance=profile,
        )
        if form.is_valid():
            form.save()
            messages.success(
                request, "Profile updated successfully."
            )
            return redirect("accounts:edit_profile")
    else:
        form = ProfileForm(instance=profile)

    return render(
        request,
        "accounts/edit_profile.html",
        {"form": form},
    )
