# apps/core/views.py
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.http import HttpResponse


def home(request):
    return render(request, "core/home.html")

def about(request):
    return render(request, "core/about.html")  # make sure this template exists


def create_admin(request):
    User = get_user_model()

    if User.objects.filter(is_superuser=True).exists():
        return HttpResponse("Superuser already exists.")

    User.objects.create_superuser(
        school_id="ADMIN-0001-H",
        email="admin@pamana.local",
        password="admin12345"
    )

    return HttpResponse("Superuser created.")