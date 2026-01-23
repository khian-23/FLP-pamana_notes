from django.urls import path

from .student_dashboard import StudentDashboardAPIView
from .student_my_notes import StudentMyNotesAPIView
from .student_upload import StudentUploadAPIView
from .subjects_list import SubjectListAPIView
from .public_notes import PublicNotesAPIView
from .note_detail import NoteDetailAPIView
from .student_saved import StudentSavedNotesAPIView
from .student_update import StudentNoteUpdateAPIView
from .admin_dashboard import AdminDashboardStatsAPIView

from .views import (
    CommentDeleteAPIView,
    NoteCommentsAPIView,
    PendingNotesAPIView,
    ModeratedNotesAPIView,
    AdminDashboardAPIView,
    approve_note,
    reject_note,
)

from .note_actions import (
    ToggleLikeAPIView,
    ToggleSaveAPIView,
    CommentAPIView,
)

urlpatterns = [
    # =====================
    # PUBLIC
    # =====================
    path("public/", PublicNotesAPIView.as_view()),
    path("subjects/", SubjectListAPIView.as_view()),

    # =====================
    # STUDENT
    # =====================
    path("student/dashboard/", StudentDashboardAPIView.as_view()),
    path("student/my-notes/", StudentMyNotesAPIView.as_view()),
    path("student/upload/", StudentUploadAPIView.as_view()),
    path("student/saved/", StudentSavedNotesAPIView.as_view()),
    path("student/notes/<int:pk>/", StudentNoteUpdateAPIView.as_view()),

    path("notes/<int:note_id>/comments/", NoteCommentsAPIView.as_view()),
    path("comments/<int:pk>/", CommentDeleteAPIView.as_view()),

    path("notes/<int:pk>/", NoteDetailAPIView.as_view()),
    path("notes/<int:pk>/like/", ToggleLikeAPIView.as_view()),
    path("notes/<int:pk>/save/", ToggleSaveAPIView.as_view()),
    path("notes/<int:pk>/comments/", CommentAPIView.as_view()),

    # =====================
    # REVIEWER (ADMIN + MODERATOR)
    # =====================
    path("pending/", PendingNotesAPIView.as_view()),
    path("moderated/", ModeratedNotesAPIView.as_view()),
    path("approve/<int:pk>/", approve_note),
    path("reject/<int:pk>/", reject_note),

    # =====================
    # ADMIN ONLY
    # =====================
    path(
        "admin/dashboard/",
        AdminDashboardStatsAPIView.as_view(),
        name="admin-dashboard-stats",
    ),
]
