from django.contrib import admin

from apps.notes.models import CommentReport
from .models import FreedomPost

@admin.register(FreedomPost)
class FreedomPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'created_at')
    search_fields = ('content', 'user__school_id')
    list_filter = ('created_at',)

@admin.register(CommentReport)
class CommentReportAdmin(admin.ModelAdmin):
    list_display = ("comment", "reported_by", "created_at")
    search_fields = ("comment__content", "reported_by__school_id")