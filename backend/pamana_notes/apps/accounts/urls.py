from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static

from . import views
from .forms import SchoolIDAuthenticationForm
from apps.accounts.api.views import CustomTokenObtainPairView

app_name = "accounts"

urlpatterns = [
    # =========================
    # AUTH (HTML)
    # =========================
    path("signup/", views.signup, name="signup"),
    path(
        "login/",
        auth_views.LoginView.as_view(
            template_name="accounts/login.html",
            authentication_form=SchoolIDAuthenticationForm,
        ),
        name="login",
    ),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),

    # =========================
    # AUTH (JWT)
    # =========================
    path("api/auth/token/", CustomTokenObtainPairView.as_view(), name="token"),

    # =========================
    # ADMIN API
    # =========================
    path("api/", include("apps.accounts.api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
