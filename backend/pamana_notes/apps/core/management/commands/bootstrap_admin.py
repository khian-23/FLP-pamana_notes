import os

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Bootstrap a single admin user from environment variables."

    def handle(self, *args, **options):
        school_id = os.environ.get("ADMIN_BOOTSTRAP_SCHOOL_ID")
        email = os.environ.get("ADMIN_BOOTSTRAP_EMAIL")
        password = os.environ.get("ADMIN_BOOTSTRAP_PASSWORD")

        if not school_id or not email or not password:
            raise CommandError(
                "Set ADMIN_BOOTSTRAP_SCHOOL_ID, ADMIN_BOOTSTRAP_EMAIL, "
                "and ADMIN_BOOTSTRAP_PASSWORD to create the admin."
            )

        User = get_user_model()

        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.WARNING("Superuser already exists."))
            return

        User.objects.create_superuser(
            school_id=school_id,
            email=email,
            password=password,
        )

        self.stdout.write(self.style.SUCCESS("Superuser created."))
