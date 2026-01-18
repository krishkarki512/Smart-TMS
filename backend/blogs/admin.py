from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Blog, Comment, Story

# -------------------------------------
# Category Admin
# -------------------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}  # Auto fill slug from name

# -------------------------------------
# Blog Admin
# -------------------------------------
@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'created_at', 'views', 'likes_count', 'country')
    list_filter = ('status', 'category', 'created_at', 'country')
    search_fields = ('title', 'content', 'author__username', 'tags', 'category__name')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views', 'likes_count', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = 'Likes'

# -------------------------------------
# Comment Admin
# -------------------------------------
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('short_text', 'author', 'blog', 'created_at', 'is_reply', 'likes_count')
    search_fields = ('text', 'author__username', 'blog__title')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def short_text(self, obj):
        return (obj.text[:50] + '...') if len(obj.text) > 50 else obj.text
    short_text.short_description = 'Comment Text'

    def is_reply(self, obj):
        return bool(obj.parent)
    is_reply.boolean = True
    is_reply.short_description = 'Is Reply?'

    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = 'Likes'

# -------------------------------------
# Story Admin
# -------------------------------------
@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'created_at', 'photo_preview')
    search_fields = ('name', 'location', 'message')
    readonly_fields = ('created_at', 'photo_preview')
    ordering = ('-created_at',)

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height: 80px; border-radius: 4px;" />', obj.photo.url)
        return "-"
    photo_preview.short_description = 'Photo Preview'
