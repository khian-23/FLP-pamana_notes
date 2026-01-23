from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.wall.models import (
    FreedomPost,
    FreedomComment,
)

User = get_user_model()


# ======================================================
# USER MINI SERIALIZER (FOR WALL)
# ======================================================
class WallUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "school_id",
            "avatar_url",
        ]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if hasattr(obj, "profile") and obj.profile.avatar:
            if request:
                return request.build_absolute_uri(obj.profile.avatar.url)
            return obj.profile.avatar.url
        return None


# ======================================================
# COMMENT SERIALIZER (THREAD SUPPORT)
# ======================================================
class FreedomCommentSerializer(serializers.ModelSerializer):
    user = WallUserSerializer(read_only=True)
    likes_count = serializers.IntegerField(
        source="likes.count",
        read_only=True
    )
    replies = serializers.SerializerMethodField()

    class Meta:
        model = FreedomComment
        fields = [
            "id",
            "user",
            "content",
            "created_at",
            "likes_count",
            "parent",
            "replies",
        ]

    def get_replies(self, obj):
        replies = obj.replies.filter(is_deleted=False)
        return FreedomCommentSerializer(
            replies,
            many=True,
            context=self.context
        ).data


# ======================================================
# POST SERIALIZER
# ======================================================
class FreedomPostSerializer(serializers.ModelSerializer):
    user = WallUserSerializer(read_only=True)
    likes_count = serializers.IntegerField(
        source="likes.count",
        read_only=True
    )
    comments_count = serializers.IntegerField(
        source="comments.count",
        read_only=True
    )
    comments = serializers.SerializerMethodField()
    rendered_content = serializers.CharField(read_only=True)

    class Meta:
        model = FreedomPost
        fields = [
            "id",
            "user",
            "content",
            "rendered_content",
            "created_at",
            "likes_count",
            "comments_count",
            "comments",
        ]

    def get_comments(self, obj):
        comments = obj.comments.filter(
            parent__isnull=True,
            is_deleted=False
        )
        return FreedomCommentSerializer(
            comments,
            many=True,
            context=self.context
        ).data


# ======================================================
# CREATE POST SERIALIZER
# ======================================================
class FreedomPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreedomPost
        fields = ["content"]

    def create(self, validated_data):
        request = self.context["request"]
        return FreedomPost.objects.create(
            user=request.user,
            content=validated_data["content"]
        )


# ======================================================
# CREATE COMMENT SERIALIZER
# ======================================================
class FreedomCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreedomComment
        fields = [
            "post",
            "content",
            "parent",
        ]

    def create(self, validated_data):
        request = self.context["request"]
        return FreedomComment.objects.create(
            user=request.user,
            **validated_data
        )
