from rest_framework import serializers
from apps.notes.models import Note


# Used by normal users (existing APIs)
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = "__all__"


# Used by admin / moderator APIs
class AdminNoteSerializer(serializers.ModelSerializer):
    author_school_id = serializers.CharField(source="uploader.school_id")
    subject = serializers.CharField(source="subject.name", default=None)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "status",
            "author_school_id",
            "subject",
            "uploaded_at",
            "rejection_reason",
        ]

    def get_status(self, obj):
        if obj.is_approved:
            return "approved"
        if obj.is_rejected:
            return "rejected"
        return "pending"