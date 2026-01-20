from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notes.models import Note


class StudentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        data = {
            "my_notes": Note.objects.filter(
                uploader=user, is_deleted=False
            ).count(),
            "approved": Note.objects.filter(
                uploader=user, is_approved=True, is_deleted=False
            ).count(),
            "pending": Note.objects.filter(
                uploader=user,
                is_approved=False,
                is_rejected=False,
                is_deleted=False
            ).count(),
            "rejected": Note.objects.filter(
                uploader=user, is_rejected=True, is_deleted=False
            ).count(),
        }

        return Response(data)
