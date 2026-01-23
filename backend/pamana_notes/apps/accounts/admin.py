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

# ======================================================
# VALIDATORS (STUDENTS ONLY)
# ======================================================
school_id_validator = RegexValidator(
    regex=r"^\d{4}-\d{4}-H$",
    message="School ID must be in the format NNNN-NNNN-H (e.g. 1234-5678-H).",
)

# ======================================================
# STUDENT FORMS
# ======================================================
class StudentCreationForm(UserCreationForm):
    school_id = forms.CharField(
        validators=[school_id_validator],
        help_text="Format: NNNN-NNNN-H",
    )

    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)

    course = forms.ModelChoiceField(
        queryset=Course.objects.order_by("name"),
        required=True,
        help_text="Student course",
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
        user.role = CustomUser.Role.STUDENT
        if commit:
            user.save()
        return user


class StudentChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = (
            "school_id",
            "email",
            "first_name",
            "last_name",
            "course",
            "is_active",
        )


# ======================================================
# ADMIN / SYSTEM USER FORMS
# ======================================================
class AdminCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = (
            "school_id",  # acts as ADMIN ID
            "email",
        )

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = CustomUser.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.course = None
        user.first_name = ""
        user.last_name = ""
        if commit:
            user.save()
        return user


class AdminChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = (
            "school_id",
            "email",
            "is_staff",
            "is_superuser",
            "is_active",
            "groups",
            "user_permissions",
        )


# ======================================================
# STUDENT ADMIN PANEL
# ======================================================
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = (
        "school_id",
        "email",
        "first_name",
        "last_name",
        "role",
        "course",
        "is_staff",
        "is_active",
    )

    list_filter = (
        "role",
        "course",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "school_id",
        "email",
    )

    ordering = ("school_id",)

    # ============================
    # VIEW / EDIT
    # ============================
    fieldsets = (
        (None, {
            "fields": (
                "school_id",
                "email",
                "password",
            ),
        }),
        ("Personal Info", {
            "fields": (
                "first_name",
                "last_name",
                "course",
            ),
        }),
        ("Permissions", {
            "fields": (
                "role",
                "is_staff",
                "is_superuser",
                "is_active",
                "groups",
                "user_permissions",
            ),
        }),
        ("Dates", {
            "fields": ("last_login", "date_joined"),
        }),
    )


    # ============================
    # ADD USER (STUDENT DEFAULT)
    # ============================
    add_form = StudentCreationForm
    form = StudentChangeForm

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
            ),
        }),
    )

    @transaction.atomic
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        # 🔒 ENROLL ONLY STUDENTS
        if obj.role != CustomUser.Role.STUDENT:
            return

        course = getattr(obj, "course", None)
        if not course:
            return

        Enrollment.objects.get_or_create(
            student=obj,
            course=course,
        )
