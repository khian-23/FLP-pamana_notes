from django.shortcuts import render, get_object_or_404
from .models import Subject

def subject_list(request):
    subjects = Subject.objects.all()
    return render(request, "subjects/subject_list.html", {"subjects": subjects})

def subject_detail(request, pk):
    subject = get_object_or_404(Subject, pk=pk)
    return render(request, "subjects/subject_detail.html", {"subject": subject})
