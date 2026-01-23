from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse

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
    if request.method == "POST":
        form = SchoolIDAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(
                request, f"Welcome back, {user.school_id}!"
            )
            return redirect("core:home")
        else:
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
            bookmarked_by__user=request.user,
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
