from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from PIL import Image

from apps.subjects.models import Course, Enrollment
from .models import Profile, CustomUser

User = get_user_model()

# ============================
# Validators (STUDENTS ONLY)
# ============================
school_id_validator = RegexValidator(
    regex=r"^\d{4}-\d{4}-H$",
    message="School ID must be in the format NNNN-NNNN-H (e.g. 1234-5678-H).",
)

# ======================================================
# STUDENT USER CREATION FORM
# ======================================================
class StudentUserCreationForm(UserCreationForm):
    school_id = forms.CharField(
        validators=[school_id_validator],
        help_text="Format: NNNN-NNNN-H",
    )

    first_name = forms.CharField(
        max_length=150,
        required=True,
        label="First Name",
    )

    last_name = forms.CharField(
        max_length=150,
        required=True,
        label="Last Name",
    )

    course = forms.ModelChoiceField(
        queryset=Course.objects.all(),
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
            "password1",
            "password2",
            "course",
        )

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = CustomUser.Role.STUDENT

        if commit:
            user.save()

            # 🔒 Enroll STUDENT only
            Enrollment.objects.get_or_create(
                student=user,
                course=self.cleaned_data["course"],
            )

        return user


# ======================================================
# ADMIN / SUPERUSER CREATION FORM
# ======================================================
class AdminUserCreationForm(UserCreationForm):
    """
    Used ONLY for system admins.
    No course, no name, no school format enforcement.
    """

    class Meta:
        model = User
        fields = (
            "school_id",  # acts as ADMIN ID
            "email",
            "password1",
            "password2",
        )

    def save(self, commit=True):
        user = super().save(commit=False)

        user.role = CustomUser.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True

        # 🔒 Admins do NOT belong to a course
        user.course = None
        user.first_name = ""
        user.last_name = ""

        if commit:
            user.save()

        return user


# ======================================================
# AUTHENTICATION FORM (SCHOOL ID LOGIN)
# ======================================================
class SchoolIDAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        label="School ID / Admin ID",
        widget=forms.TextInput(
            attrs={"placeholder": "1234-5678-H or ADMIN-ID"}
        ),
    )


# ======================================================
# PROFILE FORM
# ======================================================
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ("avatar", "bio")
        widgets = {
            "avatar": forms.ClearableFileInput(
                attrs={"accept": "image/*"}
            ),
        }

    def clean_avatar(self):
        avatar = self.cleaned_data.get("avatar")
        if avatar and avatar.size > 2 * 1024 * 1024:  # 2MB
            raise forms.ValidationError(
                "Image file too large (max 2MB)."
            )
        if avatar:
            try:
                image = Image.open(avatar)
                image.verify()
            except Exception:
                raise forms.ValidationError(
                    "Invalid image file."
                )
        return avatar
