from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.models import Profile

User = get_user_model()


# =========================
# JWT SERIALIZER (UNCHANGED)
# =========================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["school_id"] = user.school_id
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser

        return token


# =========================
# ADMIN USER SERIALIZER
# =========================
class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "school_id",
            "email",
            "full_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
        ]

    def get_full_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.school_id

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.is_staff:
            return "moderator"
        return "student"


# =========================
# STUDENT PROFILE SERIALIZER
# =========================
class StudentProfileSerializer(serializers.ModelSerializer):
    school_id = serializers.CharField(source="user.school_id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "school_id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "avatar_url",
            "bio",
        ]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and hasattr(obj.avatar, "url"):
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


# =========================
# STUDENT PROFILE UPDATE SERIALIZER
# =========================
class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        source="user.first_name",
        required=False
    )
    last_name = serializers.CharField(
        source="user.last_name",
        required=False
    )
    email = serializers.EmailField(source="user.email", required=False)
    class Meta:
        model = Profile
        fields = [
            "first_name",
            "last_name",
            "email",
            "avatar",
            "bio",
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        # Update user fields
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "school_id",
            "email",
            "first_name",
            "last_name",
        )