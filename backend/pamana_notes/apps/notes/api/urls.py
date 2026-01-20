from django.urls import path
from .views import (
    PendingNotesAPIView,
    ModeratedNotesAPIView,
    AdminDashboardAPIView,
    approve_note,
    reject_note,
)

urlpatterns = [
    path("pending/", PendingNotesAPIView.as_view(), name="pending-notes"),
    path("moderated/", ModeratedNotesAPIView.as_view(), name="moderated-notes"),
    path("dashboard/", AdminDashboardAPIView.as_view(), name="dashboard-api"),
    path("approve/<int:pk>/", approve_note, name="approve-note"),
    path("reject/<int:pk>/", reject_note, name="reject-note"),
]
