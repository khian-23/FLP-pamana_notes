from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.notes.models import Note
from apps.subjects.models import Subject
from apps.notes.api.serializers import AdminNoteSerializer


class StudentUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        subject_id = request.data.get("subject")
        visibility = request.data.get("visibility")

        if not subject_id:
            return Response(
                {"detail": "Subject is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        subject = Subject.objects.filter(id=subject_id).first()
        if not subject:
            return Response(
                {"detail": "Invalid subject."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔒 RULE 1: General subjects cannot be course-visible
        if visibility == "course" and subject.course is None:
            return Response(
                {"detail": "General subjects cannot use course visibility."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔒 RULE 2: Major subjects must match user course
        if visibility == "course":
            if subject.course != user.course:
                return Response(
                    {"detail": "You cannot upload a course note for another course."},
                    status=status.HTTP_403_FORBIDDEN
                )

        note = Note.objects.create(
            uploader=user,
            title=request.data.get("title"),
            description=request.data.get("description", ""),
            file=request.FILES.get("file"),
            subject=subject,
            visibility=visibility,
        )

        return Response(
            AdminNoteSerializer(
                note,
                context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED
        )
