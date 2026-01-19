from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from apps.subjects.models import Enrollment

from apps.subjects.models import Course
from .models import Profile

User = get_user_model()

# ============================
# Validators
# ============================
school_id_validator = RegexValidator(
    regex=r"^\d{4}-\d{4}-H$",
    message="School ID must be in the format NNNN-NNNN-H (e.g. 1234-5678-H).",
)

# ============================
# Custom User Creation Form
# ============================
class CustomUserCreationForm(UserCreationForm):
    school_id = forms.CharField(
        validators=[school_id_validator],
        help_text="Format: NNNN-NNNN-H",
    )

    course = forms.ModelChoiceField(
        queryset=Course.objects.all(),
        required=True,
        help_text="Select the student's course.",
    )

    class Meta:
        model = User
        fields = ("school_id", "email", "password1", "password2", "course")

    def save(self, commit=True):
        user = super().save(commit=False)

        if commit:
            user.save()
            course = self.cleaned_data["course"]
            Enrollment.objects.create(student=user, course=course)

        return user

# ============================
# Authentication Form (School ID Login)
# ============================
class SchoolIDAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        label="School ID",
        widget=forms.TextInput(attrs={"placeholder": "1234-5678-H"}),
    )

# ============================
# Profile Form
# ============================
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ("image",)
        widgets = {
            "image": forms.ClearableFileInput(attrs={"accept": "image/*"}),
        }
    def clean_image(self):
        image = self.cleaned_data.get("image")
        if image:
            if image.size > 2 * 1024 * 1024:  # 2MB limit
                raise forms.ValidationError("Image file too large ( > 2MB ).")
        return image