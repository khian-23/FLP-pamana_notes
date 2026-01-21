from django.urls import path

from .views import (
    PendingNotesAPIView,
    ModeratedNotesAPIView,
    AdminDashboardAPIView,
    approve_note,
    bulk_reject_notes,
    reject_note,
    public_notes_api,
)
from .student_my_notes import StudentMyNotesAPIView
from .student_upload import StudentUploadNoteAPIView
from .subjects_list import SubjectListAPIView

from .student_dashboard import StudentDashboardAPIView  # ✅ ADD THIS

urlpatterns = [
    # PUBLIC
    path("public/", public_notes_api),
    path("student/my-notes/", StudentMyNotesAPIView.as_view()),
    path("student/upload/", StudentUploadNoteAPIView.as_view()),
    path("", SubjectListAPIView.as_view()),

    # STUDENT
    path("student/dashboard/", StudentDashboardAPIView.as_view()),  # ✅ ADD THIS

    # ADMIN
    path("pending/", PendingNotesAPIView.as_view(), name="pending-notes"),
    path("moderated/", ModeratedNotesAPIView.as_view(), name="moderated-notes"),
    path("dashboard/", AdminDashboardAPIView.as_view(), name="dashboard-api"),
    path("approve/<int:pk>/", approve_note, name="approve-note"),
    path("reject/<int:pk>/", reject_note, name="reject-note"),
    path("bulk-reject/", bulk_reject_notes, name="bulk-reject"),
]
