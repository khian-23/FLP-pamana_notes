from django.urls import re_path
from .consumers import CommentConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/notes/(?P<note_id>\d+)/comments/$",
        CommentConsumer.as_asgi(),
    ),
]