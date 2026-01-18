from django.contrib import admin

admin.site.site_header = "Smart TMS Administration"
admin.site.site_title = "Smart TMS Admin Portal"
admin.site.index_title = "Welcome to Smart TMS Admin Dashboard"

from django.utils.html import format_html
from django.utils import timezone
from .models import User, UserOTP, EmergencyContact, NewsletterSubscriber


# -------------------------
# Custom User Admin
# -------------------------
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'email', 'username', 'phone', 'nationality', 'is_staff', 'is_active', 'profile_image_preview'
    )
    search_fields = ('email', 'username', 'phone')
    list_filter = ('is_staff', 'is_active', 'nationality')
    readonly_fields = ('profile_image_preview',)
    ordering = ('email',)

    fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password')
        }),
        ('Personal info', {
            'fields': ('phone', 'nationality', 'profile_image', 'profile_image_preview')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )

    def profile_image_preview(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" style="height: 60px; border-radius: 50%;" />',
                obj.profile_image.url
            )
        return "-"
    profile_image_preview.short_description = "Profile Image"


# -------------------------
# UserOTP Admin
# -------------------------
@admin.register(UserOTP)
class UserOTPAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'otp_type', 'otp', 'created_at', 'expires_at', 'is_expired')
    search_fields = ('user__email', 'otp', 'otp_type')
    list_filter = ('otp_type', 'created_at', 'expires_at')
    readonly_fields = ('created_at', 'expires_at')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "User Email"
    user_email.admin_order_field = 'user__email'

    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = "Expired"


# -------------------------
# EmergencyContact Admin
# -------------------------
@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'name', 'phone', 'email')
    search_fields = ('user__email', 'name', 'phone', 'email')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "User Email"
    user_email.admin_order_field = 'user__email'


# -------------------------
# NewsletterSubscriber Admin
# -------------------------
@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at', 'subscription_age')
    search_fields = ('email',)
    readonly_fields = ('subscribed_at', 'subscription_age')
    ordering = ('-subscribed_at',)

    def subscription_age(self, obj):
        delta = timezone.now() - obj.subscribed_at
        days = delta.days
        hours = delta.seconds // 3600
        minutes = (delta.seconds // 60) % 60
        return f"{days}d {hours}h {minutes}m ago"
    subscription_age.short_description = "Time Since Subscribed"