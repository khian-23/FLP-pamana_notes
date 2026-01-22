from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.validators import RegexValidator
from django.db import transaction

from .models import CustomUser
from apps.subjects.models import Course, Enrollment

User = get_user_model()

# -----------------------------
# Validators
# -----------------------------
school_id_validator = RegexValidator(
    regex=r"^\d{4}-\d{4}-H$",
    message="School ID must be in the format NNNN-NNNN-H (e.g. 1234-5678-H).",
)

# -----------------------------
# Forms
# -----------------------------
class CustomUserCreationForm(UserCreationForm):
    """
    Admin-only user creation form.
    Course enrollment is handled in the admin layer.
    """

    school_id = forms.CharField(
        validators=[school_id_validator],
        help_text="Format: NNNN-NNNN-H",
    )

    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)

    course = forms.ModelChoiceField(
        queryset=Course.objects.order_by("name"),
        required=True,
        help_text="Select the student's course.",
    )

    class Meta:
        model = User
        fields = (
            "school_id",
            "email",
            "first_name",
            "last_name",
        )

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = (
            "school_id",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_active",
            "is_superuser",
            "groups",
        )

# -----------------------------
# Admin
# -----------------------------
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    # ============================
    # LIST VIEW
    # ============================
    list_display = (
        "school_id",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
        "is_superuser",
    )

    list_filter = (
        "is_staff",
        "is_active",
        "is_superuser",
        "role",
        "course",
    )

    search_fields = (
        "school_id",
        "email",
        "first_name",
        "last_name",
    )

    ordering = ("school_id",)

    # ============================
    # DETAIL VIEW
    # ============================
    fieldsets = (
        (None, {
            "fields": (
                "school_id",
                "email",
                "password",
            ),
        }),
        ("Personal info", {
            "fields": (
                "first_name",
                "last_name",
                "course",
            ),
        }),
        ("Permissions", {
            "fields": (
                "is_staff",
                "is_superuser",
                "is_active",
                "groups",
                "user_permissions",
            ),
        }),
        ("Important dates", {
            "fields": ("last_login", "date_joined"),
        }),
    )

    # ============================
    # ADD VIEW
    # ============================
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "school_id",
                "email",
                "first_name",
                "last_name",
                "password1",
                "password2",
                "course",
                "is_staff",
                "is_active",
            ),
        }),
    )

    @transaction.atomic
    def save_model(self, request, obj, form, change):
        """
        Persist the user, then ensure course enrollment.
        """
        super().save_model(request, obj, form, change)

        course = form.cleaned_data.get("course")
        if not course:
            return

        Enrollment.objects.get_or_create(
            student=obj,
            course=course,
        )
