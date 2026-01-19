# apps/subjects/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone


class Course(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Courses"

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=255)
    course = models.ForeignKey(
        'Course', null=True, blank=True, on_delete=models.SET_NULL, related_name='subjects'
    )
    is_major = models.BooleanField(default=False)
    is_general = models.BooleanField(default=False)  # ✅ New field

    def save(self, *args, **kwargs):
        # Automatically mark as general if no course assigned
        if self.course is None:
            self.is_general = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)


def get_available_subjects_for_student(student):
    student_course = student.course  # or enrollment.course
    return Subject.objects.filter(
        models.Q(course=student_course) | models.Q(is_general=True)
    )