from django.urls import path
from .views import PublicSubjectListAPIView
from .subjects_list import SubjectListAPIView
from .public_courses import PublicCourseListAPIView

urlpatterns = [
    # subjects
    path("", SubjectListAPIView.as_view(), name="subject-list"),
    path("public/", PublicSubjectListAPIView.as_view(), name="public-subjects"),

    # courses
    path("courses/public/", PublicCourseListAPIView.as_view(), name="public-courses"),
]
