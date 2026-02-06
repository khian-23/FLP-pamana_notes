from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.subjects.models import Course


class PublicCourseListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        courses = Course.objects.all().order_by("name")
        return Response(
            [{"id": c.id, "name": c.name} for c in courses]
        )
