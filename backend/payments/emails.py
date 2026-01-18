from django.core.mail import send_mail
from django.conf import settings


def send_booking_success_email(booking):
    subject = f"✅ Booking Confirmed - {booking.travel_deal.title}"
    to_email = booking.email

    message = f"""Hi {booking.full_name},

Thank you for booking '{booking.travel_deal.title}' starting on {booking.date_option.start_date}.

🔖 Booking Details:
- Booking ID: {booking.id}
- Travellers: {booking.travellers}
- Room Option: {booking.room_option.capitalize()}
- Amount Paid: ${booking.payment_amount}

Your booking is confirmed. If you need further assistance, feel free to reach out to us.

Best regards,  
Golden Travel Team
{settings.DEFAULT_FROM_EMAIL}
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )


def send_booking_cancellation_email(booking):
    subject = f"❌ Booking Cancelled - {booking.travel_deal.title}"
    to_email = booking.email

    message = f"""Hi {booking.full_name},

Your booking for '{booking.travel_deal.title}' starting on {booking.date_option.start_date} has been cancelled.

💰 Refund Process:
Refunds are processed manually. Please contact our support team at {settings.DEFAULT_FROM_EMAIL} with your booking ID ({booking.id}) to initiate your refund.

If you canceled by mistake or have any questions, feel free to reply to this email.

Best regards,  
Golden Travel Team
{settings.DEFAULT_FROM_EMAIL}
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )
