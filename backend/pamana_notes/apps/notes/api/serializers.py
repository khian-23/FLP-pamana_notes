from rest_framework import serializers
from apps.notes.models import Note, Comment


class AdminNoteSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name", read_only=True)
    author_school_id = serializers.CharField(
        source="uploader.school_id", read_only=True
    )
    likes_count = serializers.IntegerField(
        source="likes.count", read_only=True
    )
    saves_count = serializers.IntegerField(
        source="saves.count", read_only=True
    )

    # ✅ THIS WAS MISSING
    is_saved = serializers.SerializerMethodField()

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.saves.filter(id=request.user.id).exists()

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "description",
            "file",
            "subject",
            "visibility",
            "author_school_id",
            "uploaded_at",
            "likes_count",
            "saves_count",
            "is_saved",  # ✅ now valid
        ]


class CommentSerializer(serializers.ModelSerializer):
    user_school_id = serializers.CharField(
        source="user.school_id", read_only=True
    )
    replies = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "content",
            "user_school_id",
            "created_at",
            "parent",
            "replies",
            "can_delete",
        ]

    def get_replies(self, obj):
        return CommentSerializer(
            obj.replies.all().order_by("created_at"),
            many=True
        ).data

    def get_can_delete(self, obj):
        request = self.context.get("request")
        if not request:
            return False
        return request.user == obj.user or request.user.is_staff