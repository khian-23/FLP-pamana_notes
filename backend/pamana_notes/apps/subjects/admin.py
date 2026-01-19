from django import forms
from django.contrib import admin
from .models import Course, Subject, Enrollment

# Unregister if already registered
for model in (Course, Subject, Enrollment):
    try:
        admin.site.unregister(model)
    except admin.sites.NotRegistered:
        pass

# --- Course admin ---
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "created_at", "updated_at")
    search_fields = ("name", "description")
    list_filter = ("created_at",)
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")

# --- Subject form to hide/show course ---
class SubjectAdminForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and not self.instance.is_major:
            self.fields['course'].widget = forms.HiddenInput()
        else:
            self.fields['course'].widget = forms.Select()

# --- Subject admin ---

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "is_major")
    list_filter = ("course", "is_major")
    search_fields = ("name", "course__name")
    ordering = ("course__name", "name")

# --- Enrollment admin ---
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course")
    search_fields = ("student__school_id", "student__email", "course__name")
    list_filter = ("course",)
    autocomplete_fields = ("student", "course")
    ordering = ("course__name", "student__school_id")
