from django.contrib.auth import get_user_model
from rest_framework import serializers, status
from rest_framework.validators import UniqueValidator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle

from apps.subjects.models import Course, Enrollment

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        required=True
    )
    school_id = serializers.CharField(
        validators=[
            UniqueValidator(queryset=User.objects.all())
        ]
    )
    email = serializers.EmailField(
        validators=[
            UniqueValidator(queryset=User.objects.all())
        ]
    )

    class Meta:
        model = User
        fields = [
            "school_id",
            "email",
            "first_name",
            "last_name",
            "course",
            "password",
            "confirm_password",
        ]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        course = validated_data.pop("course")

        # 1️⃣ Create user
        user = User.objects.create_user(
            password=password,
            course=course,
            **validated_data
        )

        # 2️⃣ Create enrollment (CRITICAL FIX)
        Enrollment.objects.create(
            student=user,
            course=course
        )

        return user


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Registration successful"},
            status=status.HTTP_201_CREATED
        )
