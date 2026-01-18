from django.db import models
from django.conf import settings
from destinations.models import TravelDeal, TravelDealDate
from django.utils import timezone


class Booking(models.Model):
    PAYMENT_METHODS = [
        ("stripe", "Stripe"),
        ("paypal", "PayPal"),
        ("manual", "Manual"),
    ]

    PAYMENT_STATUS = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    ROOM_CHOICES = [
        ('shared', 'Shared'),
        ('private', 'Private'),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("canceled", "Canceled"),
    ]

    # Foreign keys
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    travel_deal = models.ForeignKey(TravelDeal, on_delete=models.CASCADE)
    date_option = models.ForeignKey(TravelDealDate, on_delete=models.CASCADE)

    # Personal details
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    town = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postcode = models.CharField(max_length=20)
    country = models.CharField(max_length=100)

    # Booking details
    travellers = models.PositiveIntegerField(default=1)
    room_option = models.CharField(max_length=20, choices=ROOM_CHOICES, default='shared')
    add_transfer = models.BooleanField(default=False)
    add_nights = models.BooleanField(default=False)
    flight_help = models.BooleanField(default=False)
    donation = models.BooleanField(default=False)

    # Payment info
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, blank=True, null=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="pending")
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    payment_date = models.DateTimeField(blank=True, null=True)

    # Booking status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    canceled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def can_be_canceled(self):
        return self.status not in ["completed", "canceled"]

    def cancel(self):
        if self.can_be_canceled():
            self.status = "canceled"
            self.canceled_at = timezone.now()
            self.save()

    def __str__(self):
        return f"Booking by {self.user} - {self.travel_deal.title} - {self.date_option.start_date}"

class BookingLocation(models.Model):
    booking = models.ForeignKey(Booking, related_name='locations', on_delete=models.CASCADE)
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.booking.id} @ ({self.latitude}, {self.longitude}) at {self.timestamp}"
