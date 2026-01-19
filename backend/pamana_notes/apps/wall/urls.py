from django.urls import path
from . import views
from .api_views import notes_list

app_name = "wall"

urlpatterns = [
    path("", views.freedom_wall, name="freedom_wall"),
    path("post/<int:post_id>/", views.post_detail, name="post_detail"),
    path("post/<int:post_id>/comment/add/", views.add_comment, name="add_comment"),
    path(
        "post/<int:post_id>/comment/<int:comment_id>/reply/",
        views.reply_comment,
        name="reply_comment"
    ),
    path("post/<int:post_id>/like/", views.toggle_like, name="toggle_like"),
    path("comment/<int:comment_id>/report/", views.report_comment, name="report_comment"),
    path(
    "comment/<int:comment_id>/replies/",
    views.comment_replies_modal,
    name="comment_replies_modal"
    ),
    path(
        "comment/<int:comment_id>/thread/",
        views.comment_thread,
        name="comment_thread"
    ),
    path("api/notes/", notes_list),

]
