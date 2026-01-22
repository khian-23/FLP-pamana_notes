from django.urls import path
from . import views
from .api_views import (
    notes_list_api,
    pending_notes_api,
    approve_note_api,
    reject_note_api,
)
from django.urls import path, include

app_name = "notes"

urlpatterns = [
    # ======================
    # HTML VIEWS
    # ======================
    path("", views.notes_list, name="note_list"),
    path("upload/", views.note_upload),
    path("<int:pk>/", views.note_detail),
    path("<int:pk>/update/", views.note_update),
    path("<int:pk>/delete/", views.note_delete),
    path("<int:pk>/download/", views.download_note),

    path("my-notes/", views.my_notes),
    path("saved/", views.saved_notes_list),
    path("pending/", views.pending_notes),  # HTML PAGE ONLY

    path("notes/<int:note_id>/like/", views.ToggleLikeAPIView.as_view()),

    # ======================
    # API (JSON ONLY)
    # ======================
    path("api/notes/", notes_list_api),
    path("api/pending/", pending_notes_api),
    path("api/approve/<int:pk>/", approve_note_api),
    path("api/reject/<int:pk>/", reject_note_api),
    path("api/", include("apps.notes.api.urls")),
]
