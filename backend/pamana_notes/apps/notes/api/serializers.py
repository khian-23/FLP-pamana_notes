from rest_framework import serializers
from apps.notes.models import Note, Comment


# ======================================================
# ADMIN / LIST / PUBLIC NOTE SERIALIZER
# ======================================================
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

    is_saved = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()  # ✅ REQUIRED

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.saves.filter(user=request.user).exists()

    def get_status(self, obj):
        if obj.is_approved:
            return "approved"
        if obj.is_rejected:
            return "rejected"
        return "pending"

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
            "is_saved",
            "status",
            "is_approved",
            "is_rejected",
            "rejection_reason",
        ]

# ======================================================
# NOTE UPDATE SERIALIZER (STUDENT ONLY)
# ======================================================
class NoteUpdateSerializer(serializers.ModelSerializer):
    """
    Used for updating an existing note by its uploader.
    Allowed fields:
    - title
    - description
    - content
    - file (optional replace)
    - visibility
    """

    class Meta:
        model = Note
        fields = [
            "title",
            "description",
            "content",
            "file",
            "visibility",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        note = self.instance

        # Safety: only uploader can edit
        if request and note.uploader != request.user:
            raise serializers.ValidationError(
                "You do not have permission to edit this note."
            )

        return attrs


# ======================================================
# COMMENT SERIALIZER
# ======================================================
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
            many=True,
            context=self.context,
        ).data

    def get_can_delete(self, obj):
        request = self.context.get("request")
        if not request:
            return False
        return request.user == obj.user or request.user.is_staff
    