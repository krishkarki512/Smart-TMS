from django.urls import path
from .views import (
    BookingListAPIView,
    BookingCreateAPIView,
    BookingRetrieveAPIView,
    BookingUpdateAPIView,
    BookingPaymentUpdateAPIView,
    CreatePaymentIntentView,
    VerifyPayPalPaymentView,
    download_invoice,
    cancel_booking,
    UserRemindersAPIView,
    send_location,
    get_location_history,
)

urlpatterns = [
    path("bookings/", BookingListAPIView.as_view(), name="booking-list"),
    path("bookings/create/", BookingCreateAPIView.as_view(), name="booking-create"),
    path("bookings/<int:pk>/", BookingRetrieveAPIView.as_view(), name="booking-detail"),
    path('bookings/<int:id>/download-invoice/', download_invoice, name='download-invoice'),
    path("bookings/<int:booking_id>/cancel/", cancel_booking, name="cancel-booking"),
    path("bookings/<int:pk>/update/", BookingUpdateAPIView.as_view(), name="booking-update"),
    path("bookings/<int:pk>/update-payment/", BookingPaymentUpdateAPIView.as_view(), name="booking-payment-update"),
    path("stripe/create-intent/", CreatePaymentIntentView.as_view(), name="create-stripe-intent"),
    path("paypal/verify/", VerifyPayPalPaymentView.as_view(), name="verify-paypal"),
    path('reminders/', UserRemindersAPIView.as_view(), name='user-reminders'),
    path('bookings/<int:pk>/send-location/', send_location, name='send_location'),
    path('bookings/<int:pk>/location-history/', get_location_history, name='location_history'),
]
