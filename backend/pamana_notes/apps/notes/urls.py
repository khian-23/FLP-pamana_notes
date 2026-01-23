from django.urls import path, include
from . import views

app_name = "notes"

urlpatterns = [
    # HTML VIEWS
    path("", views.notes_list),
    path("upload/", views.note_upload),
    path("<int:pk>/", views.note_detail),
    path("<int:pk>/update/", views.note_update),
    path("<int:pk>/delete/", views.note_delete),
    path("<int:pk>/download/", views.download_note),

    path("my-notes/", views.my_notes),
    path("saved/", views.saved_notes_list),
    path("pending/", views.pending_notes),

    # API (DRF ONLY)
    path("api/", include("apps.notes.api.urls")),
]
