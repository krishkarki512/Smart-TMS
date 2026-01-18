from django.contrib import admin
from .models import ContactMessage

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'subject', 'short_message', 'created_at')
    search_fields = ('full_name', 'email', 'phone', 'subject', 'message')
    list_filter = ('created_at',)
    readonly_fields = ('full_name', 'email', 'phone', 'subject', 'message', 'created_at')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': ('full_name', 'email', 'phone', 'subject', 'message')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def short_message(self, obj):
        # Show first 50 chars of the message with ellipsis if longer
        if len(obj.message) > 50:
            return obj.message[:47] + '...'
        return obj.message
    short_message.short_description = 'Message Preview'
