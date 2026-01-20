from rest_framework import serializers
from apps.notes.models import Note


class AdminNoteSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()
    author_school_id = serializers.CharField(
        source="uploader.school_id",
        read_only=True
    )
    subject = serializers.CharField(
        source="subject.name",
        read_only=True
    )
    status = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = (
            "id",
            "title",
            "author_school_id",
            "subject",
            "status",
            "uploaded_at",
            "rejection_reason",
            "file",
        )

    def get_status(self, obj):
        if obj.is_approved:
            return "approved"
        if obj.is_rejected:
            return "rejected"
        return "pending"

    def get_file(self, obj):
        if not obj.file:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

