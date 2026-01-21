from django.urls import path
from .views import PublicSubjectListAPIView

urlpatterns = [
    path("public/", PublicSubjectListAPIView.as_view(), name="public-subjects"),
]
