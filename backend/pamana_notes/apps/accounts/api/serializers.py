from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
# ADMIN USER SERIALIZER (FIXED)
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
