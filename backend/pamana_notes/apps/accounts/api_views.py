from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView

@api_view(["GET"])
def notes_list(request):
    return Response({
        "notes": [
            {"id": 1, "title": "Sample Note", "content": "Hello from Django"},
            {"id": 2, "title": "Another Note", "content": "React is connected"}
        ]
    })

class CustomTokenSerializer(TokenObtainPairSerializer):
    username_field = "school_id"

    def validate(self, attrs):
        credentials = {
            "school_id": attrs.get("school_id"),
            "password": attrs.get("password"),
        }

        user = authenticate(**credentials)

        if not user:
            raise Exception("Invalid credentials")

        data = super().validate(attrs)
        return data


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer