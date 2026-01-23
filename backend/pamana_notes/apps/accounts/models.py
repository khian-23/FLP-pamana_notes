from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.templatetags.static import static

from apps.subjects.models import Course


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    # ======================================================
    # CREATE USER
    # ======================================================
    def create_user(self, school_id, email=None, password=None, **extra_fields):
        if not school_id:
            raise ValueError("The School ID must be set")
        if not email:
            raise ValueError("Email must be set")

        role = extra_fields.get("role", CustomUser.Role.STUDENT)

        # ==================================================
        # STUDENT VALIDATION
        # ==================================================
        if role == CustomUser.Role.STUDENT:
            if not extra_fields.get("first_name"):
                raise ValueError("First name must be set for students")
            if not extra_fields.get("last_name"):
                raise ValueError("Last name must be set for students")
            if not extra_fields.get("course"):
                raise ValueError("Course must be set for students")

            course = extra_fields.pop("course")
            if isinstance(course, (int, str)):
                course = Course.objects.get(pk=course)

        # ==================================================
        # MODERATOR (FACULTY) VALIDATION
        # ==================================================
        elif role == CustomUser.Role.MODERATOR:
            if not extra_fields.get("first_name"):
                raise ValueError("First name must be set for moderators")
            if not extra_fields.get("last_name"):
                raise ValueError("Last name must be set for moderators")
            if not extra_fields.get("course"):
                raise ValueError("Course must be set for moderators")

            course = extra_fields.pop("course")
            if isinstance(course, (int, str)):
                course = Course.objects.get(pk=course)

        # ==================================================
        # ADMIN VALIDATION
        # ==================================================
        else:  # ADMIN
            course = None
            extra_fields.setdefault("first_name", "")
            extra_fields.setdefault("last_name", "")

        email = self.normalize_email(email)

        user = self.model(
            school_id=school_id.strip(),
            email=email,
            course=course,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    # ======================================================
    # CREATE SUPERUSER (ADMIN ONLY)
    # ======================================================
    def create_superuser(self, school_id, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", CustomUser.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(
            school_id=school_id,
            email=email,
            password=password,
            **extra_fields,
        )


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        MODERATOR = "moderator", "Moderator"
        ADMIN = "admin", "Admin"

    username = None

    school_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
    )

    email = models.EmailField(unique=True)

    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    # 🔑 Used by BOTH students and moderators
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    saved_notes = models.ManyToManyField(
        "notes.Note",
        blank=True,
        related_name="saved_by",
    )

    USERNAME_FIELD = "school_id"
    REQUIRED_FIELDS = ["email"]

    objects = CustomUserManager()

    def __str__(self):
        return self.school_id

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def avatar_url(self):
        if hasattr(self, "profile") and self.profile.avatar:
            return self.profile.avatar.url
        return static("img/default-avatar.png")


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    avatar = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    bio = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile - {self.user.school_id}"


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        if hasattr(instance, "profile"):
            instance.profile.save()
