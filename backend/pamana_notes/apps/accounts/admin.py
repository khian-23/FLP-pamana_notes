from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.validators import RegexValidator
from django.db import transaction

from .models import CustomUser
from apps.subjects.models import Course, Enrollment


# ======================================================
# VALIDATORS (STUDENTS ONLY)
# ======================================================
school_id_validator = RegexValidator(
    regex=r"^\d{4}-\d{4}-H$",
    message="School ID must be in the format NNNN-NNNN-H (e.g. 1234-5678-H).",
)


# ======================================================
# ROLE-AWARE CREATION FORM (ADMIN ONLY)
# ======================================================
class RoleBasedUserCreationForm(UserCreationForm):
    role = forms.ChoiceField(
        choices=CustomUser.Role.choices,
        initial=CustomUser.Role.STUDENT,
    )

    course = forms.ModelChoiceField(
        queryset=Course.objects.order_by("name"),
        required=False,
    )

    class Meta:
        model = CustomUser
        fields = (
            "school_id",
            "email",
            "role",
            "course",
            "password1",
            "password2",
        )

    def clean(self):
        cleaned = super().clean()
        role = cleaned.get("role")
        course = cleaned.get("course")

        # 🔒 STUDENT VALIDATION
        if role == CustomUser.Role.STUDENT and not course:
            raise forms.ValidationError(
                "Course is required when creating a student."
            )

        return cleaned

    def save(self, commit=True):
        user = super().save(commit=False)
        role = self.cleaned_data["role"]

        user.role = role

        if role == CustomUser.Role.ADMIN:
            user.is_staff = True
            user.is_superuser = True
            user.course = None
            user.first_name = ""
            user.last_name = ""

        elif role == CustomUser.Role.MODERATOR:
            user.is_staff = False
            user.is_superuser = False
            user.course = None
            user.first_name = ""
            user.last_name = ""

        if commit:
            user.save()

        return user

class ModeratorCourseFilter(admin.SimpleListFilter):
    title = "Moderator course"
    parameter_name = "moderator_course"

    def lookups(self, request, model_admin):
        from apps.subjects.models import Course
        return [(c.id, c.name) for c in Course.objects.all()]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                role=CustomUser.Role.MODERATOR,
                course_id=self.value(),
            )
        return queryset
    
class RoleBasedUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = (
            "school_id",
            "email",
            "first_name",
            "last_name",
            "course",
            "role",
            "is_staff",
            "is_superuser",
            "is_active",
        )


# ======================================================
# ADMIN PANEL
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
        ModeratorCourseFilter,
        "is_staff",
        "is_active",
    )

    search_fields = ("school_id", "email")
    ordering = ("school_id",)

    # ============================
    # VIEW / EDIT
    # ============================
    fieldsets = (
        (None, {
            "fields": ("school_id", "email", "password"),
        }),
        ("Personal Info", {
            "fields": ("first_name", "last_name", "course"),
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
    # ADD USER (ROLE-AWARE)
    # ============================
    add_form = RoleBasedUserCreationForm
    form = RoleBasedUserChangeForm

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "school_id",
                "email",
                "role",
                "course",
                "password1",
                "password2",
            ),
        }),
    )

    # ============================
    # ENROLLMENT (STUDENTS ONLY)
    # ============================
    @transaction.atomic
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        if obj.role != CustomUser.Role.STUDENT:
            return

        if obj.course:
            Enrollment.objects.get_or_create(
                student=obj,
                course=obj.course,
            )
