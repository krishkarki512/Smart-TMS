from django.contrib import admin
from django.utils.html import format_html
from django.utils.timezone import localtime
from .models import Booking, BookingLocation


class BookingLocationInline(admin.TabularInline):
    model = BookingLocation
    extra = 0
    readonly_fields = ('latitude', 'longitude', 'timestamp')
    can_delete = False
    show_change_link = False
    verbose_name = "Booking Location"
    verbose_name_plural = "Booking Locations"
    classes = ('collapse',)  # collapsible inline


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_email', 'travel_deal_title', 'date_option_range', 'full_name',
        'travellers', 'room_option', 'payment_method_badge', 'payment_status_badge',
        'payment_amount_display', 'status_badge', 'created_at_display'
    )
    list_filter = ('payment_method', 'payment_status', 'status', 'room_option', 'created_at')
    search_fields = ('user__email', 'full_name', 'email', 'phone', 'travel_deal__title')
    ordering = ('-created_at',)
    readonly_fields = (
        'created_at_display', 'payment_date_display', 'canceled_at_display',
        'payment_amount', 'transaction_id',
    )
    inlines = [BookingLocationInline]
    list_per_page = 25

    fieldsets = (
        ('User & Travel Deal Information', {
            'fields': ('user', 'travel_deal', 'date_option'),
            'description': 'Select user, travel deal, and date option for booking.'
        }),
        ('Personal Details', {
            'fields': (
                'full_name', 'email', 'phone',
                'address_line1', 'address_line2', 'town', 'state', 'postcode', 'country'
            )
        }),
        ('Booking Preferences', {
            'fields': (
                'travellers', 'room_option', 'add_transfer', 'add_nights',
                'flight_help', 'donation'
            )
        }),
        ('Payment Information', {
            'fields': (
                'payment_method', 'payment_status', 'payment_amount', 'transaction_id',
                'payment_date_display'
            )
        }),
        ('Booking Status & History', {
            'fields': ('status', 'canceled_at_display', 'created_at_display')
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'

    def travel_deal_title(self, obj):
        return obj.travel_deal.title
    travel_deal_title.short_description = 'Travel Deal'
    travel_deal_title.admin_order_field = 'travel_deal__title'

    def date_option_range(self, obj):
        start = obj.date_option.start_date.strftime("%Y-%m-%d")
        end = obj.date_option.end_date.strftime("%Y-%m-%d")
        return f"{start} to {end}"
    date_option_range.short_description = 'Travel Dates'
    date_option_range.admin_order_field = 'date_option__start_date'

    def payment_method_badge(self, obj):
        color_map = {
            'stripe': 'blue',
            'paypal': 'orange',
            'manual': 'gray',
            None: 'lightgray',
        }
        color = color_map.get(obj.payment_method, 'lightgray')
        label = obj.get_payment_method_display() or 'N/A'
        return format_html(
            '<span style="color: {}; font-weight:bold;">{}</span>',
            color, label
        )
    payment_method_badge.short_description = 'Payment Method'
    payment_method_badge.admin_order_field = 'payment_method'

    def payment_status_badge(self, obj):
        color_map = {
            'pending': 'orange',
            'paid': 'green',
            'failed': 'red',
        }
        color = color_map.get(obj.payment_status, 'gray')
        label = obj.get_payment_status_display()
        return format_html(
            '<span style="color: {}; font-weight:bold;">{}</span>',
            color, label
        )
    payment_status_badge.short_description = 'Payment Status'
    payment_status_badge.admin_order_field = 'payment_status'

    def payment_amount_display(self, obj):
        if obj.payment_amount is None:
            return '-'
        return f"€{obj.payment_amount:.2f}"
    payment_amount_display.short_description = 'Payment Amount'
    payment_amount_display.admin_order_field = 'payment_amount'

    def status_badge(self, obj):
        color_map = {
            'pending': 'orange',
            'confirmed': 'blue',
            'completed': 'green',
            'canceled': 'red',
        }
        color = color_map.get(obj.status, 'gray')
        label = obj.get_status_display()
        return format_html(
            '<span style="color: {}; font-weight:bold;">{}</span>',
            color, label
        )
    status_badge.short_description = 'Booking Status'
    status_badge.admin_order_field = 'status'

    def created_at_display(self, obj):
        return localtime(obj.created_at).strftime("%Y-%m-%d %H:%M")
    created_at_display.short_description = 'Created At'
    created_at_display.admin_order_field = 'created_at'

    def payment_date_display(self, obj):
        if obj.payment_date:
            return localtime(obj.payment_date).strftime("%Y-%m-%d %H:%M")
        return '-'
    payment_date_display.short_description = 'Payment Date'

    def canceled_at_display(self, obj):
        if obj.canceled_at:
            return localtime(obj.canceled_at).strftime("%Y-%m-%d %H:%M")
        return '-'
    canceled_at_display.short_description = 'Canceled At'

    actions = ['mark_as_confirmed', 'mark_as_canceled']

    def mark_as_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f"{updated} booking(s) marked as confirmed.")
    mark_as_confirmed.short_description = "Mark selected bookings as confirmed"

    def mark_as_canceled(self, request, queryset):
        updated = 0
        for booking in queryset:
            if booking.can_be_canceled():
                booking.cancel()
                updated += 1
        self.message_user(request, f"{updated} booking(s) canceled.")
    mark_as_canceled.short_description = "Cancel selected bookings"


@admin.register(BookingLocation)
class BookingLocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking_link', 'latitude', 'longitude', 'timestamp_display')
    list_filter = ('timestamp',)
    search_fields = ('booking__id', 'booking__user__email')
    readonly_fields = ('latitude', 'longitude', 'timestamp')
    list_per_page = 50

    def booking_link(self, obj):
        url = f"/admin/payments/booking/{obj.booking.id}/change/"
        return format_html('<a href="{}">Booking #{} - {}</a>', url, obj.booking.id, obj.booking.travel_deal.title)
    booking_link.short_description = 'Booking'

    def timestamp_display(self, obj):
        return localtime(obj.timestamp).strftime("%Y-%m-%d %H:%M:%S")
    timestamp_display.admin_order_field = 'timestamp'
    timestamp_display.short_description = 'Timestamp'
