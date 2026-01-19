from django.urls import path
from . import views
from .views import create_admin
from .api_views import admin_dashboard

app_name = "core"

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("create-admin/", create_admin),

    # Admin-only API
    path("api/admin/dashboard/", admin_dashboard),
]
