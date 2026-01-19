from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from apps.subjects.models import Course, Enrollment
from django.contrib.auth.forms import UserChangeForm
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
import re
from django.db import transaction
from django.core.validators import RegexValidator
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


# -----------------------------
# Forms
# -----------------------------
school_id_validator = RegexValidator(
    regex=r"^\d{4}-\d{4}-H$",
    message="School ID must be in the format NNNN-NNNN-H (e.g. 1234-5678-H).",
)


class CustomUserCreationForm(UserCreationForm):
    """
    Admin-only user creation form.
    Handles password validation via UserCreationForm.
    Course enrollment is intentionally excluded from save()
    and handled in CustomUserAdmin.save_model().
    """

    course = forms.ModelChoiceField(
        queryset=Course.objects.order_by("name"),
        required=True,
        help_text="Select the student's course.",
    )

    school_id = forms.CharField(
        validators=[school_id_validator],
        help_text="Format: NNNN-NNNN-H",
    )

    class Meta:
        model = User
        fields = ("school_id", "email")

    def clean(self):
        """
        Hook for future cross-field validation.
        """
        cleaned_data = super().clean()
        return cleaned_data

    def save(self, commit=True):
        """
        Save the user only.
        Course assignment is handled in the admin layer.
        """
        user = super().save(commit=False)

        if commit:
            user.save()

        return user

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ("school_id", "email", "is_staff", "is_active", "is_superuser", "groups")


# -----------------------------
# Admin
# -----------------------------
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    list_display = (
        "school_id",
        "email",
        "is_staff",
        "is_active",
        "is_superuser",
    )

    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "groups",
    )

    search_fields = ("school_id", "email")
    ordering = ("school_id",)

    fieldsets = (
        (None, {
            "fields": ("school_id", "email", "password"),
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

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "school_id",
                "email",
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
        Atomic to avoid partial writes if enrollment fails.
        """
        super().save_model(request, obj, form, change)

        course = form.cleaned_data.get("course")
        if not course:
            return

        Enrollment.objects.get_or_create(
            student=obj,
            course=course,
        )