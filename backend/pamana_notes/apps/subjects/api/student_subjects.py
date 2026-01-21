from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from apps.subjects.models import Subject


class StudentSubjectListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        subjects = Subject.objects.filter(
            Q(course__isnull=True) |  # ✅ General subjects
            Q(course=user.course)     # ✅ User's major subjects
        ).order_by("name")

        return Response([
            {
                "id": s.id,
                "name": s.name,
                "type": "General" if s.course is None else "Major"
            }
            for s in subjects
        ])
