from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def notes_list(request):
    return Response({
        "notes": [
            {"id": 1, "title": "Sample Note", "content": "Hello from Django"},
            {"id": 2, "title": "Another Note", "content": "React is connected"}
        ]
    })
