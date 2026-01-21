from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.subjects.models import Subject


class SubjectListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subjects = Subject.objects.all().order_by("name")
        return Response(
            [{"id": s.id, "name": s.name} for s in subjects]
        )
