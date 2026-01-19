from django.urls import path
from . import views
from .api_views import notes_list

app_name = "subjects"   # ✅ namespace

urlpatterns = [
    path('', views.subject_list, name='list'),
    path('<int:pk>/', views.subject_detail, name='detail'),
    path("api/notes/", notes_list),
]