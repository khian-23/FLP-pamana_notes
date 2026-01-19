from django.apps import AppConfig

class WallConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.wall'  # ✅ must be 'apps.wall', NOT just 'wall'
