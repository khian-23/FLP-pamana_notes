import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils.timezone import localtime

from apps.notes.models import Comment, Note
from apps.notes.api.serializers import CommentSerializer


class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.note_id = self.scope["url_route"]["kwargs"]["note_id"]
        self.group_name = f"note_{self.note_id}"

        if isinstance(self.scope["user"], AnonymousUser):
            await self.close()
            return

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # -------------------------
    # RECEIVE SOCKET MESSAGE
    # -------------------------
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "create":
            await self.handle_create(data)
        elif action == "delete":
            await self.handle_delete(data)

    # -------------------------
    # CREATE COMMENT
    # -------------------------
    async def handle_create(self, data):
        user = self.scope["user"]
        content = data.get("content", "").strip()

        if user.is_anonymous or not content:
            return

        comment = await self._create_comment(user, content)

        serialized = CommentSerializer(comment).data

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "comment_created",
                "comment": serialized,
            }
        )

    # -------------------------
    # DELETE COMMENT
    # -------------------------
    async def handle_delete(self, data):
        user = self.scope["user"]
        comment_id = data.get("comment_id")

        if user.is_anonymous or not comment_id:
            return

        deleted = await self._delete_comment(user, comment_id)
        if not deleted:
            return

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "comment_deleted",
                "comment_id": comment_id,
            }
        )

    # -------------------------
    # SOCKET EVENTS
    # -------------------------
    async def comment_created(self, event):
        await self.send(text_data=json.dumps({
            "event": "created",
            "comment": event["comment"],
        }))

    async def comment_deleted(self, event):
        await self.send(text_data=json.dumps({
            "event": "deleted",
            "comment_id": event["comment_id"],
        }))

    # -------------------------
    # DATABASE HELPERS
    # -------------------------
    @database_sync_to_async
    def _create_comment(self, user, content):
        note = Note.objects.get(id=self.note_id)
        return Comment.objects.create(
            note=note,
            user=user,
            content=content,
        )

    @database_sync_to_async
    def _delete_comment(self, user, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id, user=user)
            comment.delete()
            return True
        except Comment.DoesNotExist:
            return False
