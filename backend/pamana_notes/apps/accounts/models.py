# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.templatetags.static import static

from apps.subjects.models import Course


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, school_id, email=None, password=None, **extra_fields):
        if not school_id:
            raise ValueError("The School ID must be set")
        email = self.normalize_email(email)
        user = self.model(school_id=school_id, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, school_id, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(school_id, email, password, **extra_fields)


class CustomUser(AbstractUser):
    school_id = models.CharField(max_length=20, unique=True)
    username = None

    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students"
    )

    USERNAME_FIELD = "school_id"
    REQUIRED_FIELDS = ["email"]

    saved_notes = models.ManyToManyField(
        "notes.Note",
        blank=True,
        related_name="saved_by"
    )

    objects = CustomUserManager()


    def __str__(self):
        return self.school_id

    @property
    def avatar_url(self):
        if hasattr(self, "profile") and self.profile.image:
            return self.profile.image.url
        return static("img/default-avatar.png")


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="profiles/", blank=True, null=True)

    def __str__(self):
        return self.user.school_id


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
    else:
        if hasattr(instance, "profile"):
            instance.profile.save()
