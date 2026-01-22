from django.urls import path

# dashboards / views
from .student_dashboard import StudentDashboardAPIView
from .student_my_notes import StudentMyNotesAPIView
from .student_upload import StudentUploadAPIView
from .subjects_list import SubjectListAPIView
from .public_notes import PublicNotesAPIView
from .note_detail import NoteDetailAPIView

# admin
from .views import (
    PendingNotesAPIView,
    ModeratedNotesAPIView,
    AdminDashboardAPIView,
    approve_note,
    bulk_reject_notes,
    reject_note,
)

# actions
from .note_actions import (
    ToggleLikeAPIView,
    ToggleSaveAPIView,
    CommentAPIView,
)

urlpatterns = [
    # =======================
    # PUBLIC
    # =======================
    path("public/", PublicNotesAPIView.as_view()),
    path("subjects/", SubjectListAPIView.as_view()),

    # =======================
    # STUDENT
    # =======================
    path("student/dashboard/", StudentDashboardAPIView.as_view()),
    path("student/my-notes/", StudentMyNotesAPIView.as_view()),
    path("student/upload/", StudentUploadAPIView.as_view()),

    path("notes/<int:pk>/", NoteDetailAPIView.as_view(), name="note-detail"),
    path("notes/<int:pk>/like/", ToggleLikeAPIView.as_view()),
    path("notes/<int:pk>/save/", ToggleSaveAPIView.as_view()),
    path("notes/<int:pk>/comments/", CommentAPIView.as_view()),

    # =======================
    # ADMIN
    # =======================
    path("pending/", PendingNotesAPIView.as_view(), name="pending-notes"),
    path("moderated/", ModeratedNotesAPIView.as_view(), name="moderated-notes"),
    path("dashboard/", AdminDashboardAPIView.as_view(), name="dashboard-api"),
    path("approve/<int:pk>/", approve_note, name="approve-note"),
    path("reject/<int:pk>/", reject_note, name="reject-note"),
    path("bulk-reject/", bulk_reject_notes, name="bulk-reject"),
]
