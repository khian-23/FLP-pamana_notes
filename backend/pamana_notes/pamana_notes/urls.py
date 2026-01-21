from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Core / pages
    path("", include("apps.core.urls")),
    path("subjects/", include("apps.subjects.urls")),

    # Accounts & Notes
    path("accounts/", include("apps.accounts.urls")),
    path("notes/", include("apps.notes.urls")),

    # API
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("api/subjects/", include("apps.subjects.api.urls")),  # ✅ CORRECT
    path("api/accounts/", include("apps.accounts.api.urls")),
    path("api/notes/", include("apps.notes.api.urls")),  # ✅ ADD THIS
    path("api/notes/", include("apps.notes.api.urls")),


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
