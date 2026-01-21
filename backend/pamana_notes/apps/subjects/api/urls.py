from django.urls import path
from .views import PublicSubjectListAPIView
from .subjects_list import SubjectListAPIView

urlpatterns = [
    path("", SubjectListAPIView.as_view(), name="subject-list"),
    path("public/", PublicSubjectListAPIView.as_view(), name="public-subjects"),
]
