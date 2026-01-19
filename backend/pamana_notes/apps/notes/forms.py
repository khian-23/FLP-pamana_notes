from django import forms
from django.db.models import Q, F, Value, CharField, Case, When
from django.db.models.functions import Concat
from apps.subjects.models import Subject
from .models import Note, Comment


class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ["title", "description", "file", "subject", "visibility"]

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)

        if user is not None:
            # Get courses the user is enrolled in
            enrolled_courses = user.enrollment_set.values_list("course", flat=True)

            # Subjects: user's courses + general subjects
            qs = Subject.objects.filter(
                Q(course__in=enrolled_courses) | Q(is_general=True)
            )

            # Annotate display name for general subjects
            qs = qs.annotate(
                display_name=Case(
                    When(is_general=True, then=Concat(F("name"), Value(" (General)"))),
                    default=F("name"),
                    output_field=CharField(),
                )
            )

            self.fields["subject"].queryset = qs
            # Use the annotated display name
            self.fields["subject"].label_from_instance = lambda obj: obj.display_name

    def clean(self):
        cleaned_data = super().clean()
        subject = cleaned_data.get("subject")

        # For major subjects, force visibility to course-only
        if subject and getattr(subject, "is_major", False):
            cleaned_data["visibility"] = "course"

        return cleaned_data


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["content"]
        widgets = {
            "content": forms.Textarea(attrs={"rows": 3, "placeholder": "Write your comment..."})
        }
