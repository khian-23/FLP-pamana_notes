from django.urls import path
from .subjects_list import SubjectListAPIView

urlpatterns = [
    path("", SubjectListAPIView.as_view()),
]
