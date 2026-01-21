from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from apps.notes.models import Note


class StudentUploadNoteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        data = request.data

        note = Note.objects.create(
            uploader=request.user,
            title=data.get("title"),
            description=data.get("description"),
            subject_id=data.get("subject"),
            visibility=data.get("visibility"),
            file=data.get("file"),
        )

        return Response(
            {"message": "Note uploaded successfully"},
            status=status.HTTP_201_CREATED,
        )
