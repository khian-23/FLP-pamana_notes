# apps/core/views.py
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.http import HttpResponse, HttpResponseForbidden
from django.conf import settings
from django.http import JsonResponse


def home(request):
    return JsonResponse({"status": "backend running"})

def about(request):
    return render(request, "core/about.html")  # make sure this template exists


def create_admin(request):
    # Disabled unless explicitly enabled for local bootstrap.
    if not settings.DEBUG or not settings.ADMIN_BOOTSTRAP_TOKEN:
        return HttpResponseForbidden("Admin bootstrap disabled.")

    token = (
        request.headers.get("X-Admin-Bootstrap-Token")
        or request.GET.get("token")
    )
    if token != settings.ADMIN_BOOTSTRAP_TOKEN:
        return HttpResponseForbidden("Invalid bootstrap token.")

    User = get_user_model()

    if User.objects.filter(is_superuser=True).exists():
        return HttpResponse("Superuser already exists.")

    User.objects.create_superuser(
        school_id="ADMIN-0001-H",
        email="admin@pamana.local",
        password="admin12345"
    )

    return HttpResponse("Superuser created.")
