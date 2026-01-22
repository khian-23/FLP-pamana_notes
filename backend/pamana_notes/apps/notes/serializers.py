from rest_framework import serializers
from apps.notes.models import Note


class NoteSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = "__all__"

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(id=request.user.id).exists()

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.saved_by.filter(id=request.user.id).exists()