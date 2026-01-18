import stripe
import requests
from django.conf import settings
from django.utils import timezone
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from datetime import date
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse, Http404
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from destinations.models import TravelDealDate
from .models import Booking, BookingLocation
from .serializers import BookingSerializer, BookingLocationSerializer
from .emails import send_booking_success_email, send_booking_cancellation_email

stripe.api_key = settings.STRIPE_SECRET_KEY

# --------------------------
# Booking CRUD Views
# --------------------------

class BookingListAPIView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')


class BookingCreateAPIView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['user'] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Check capacity before saving booking
        date_option = data.get('date_option_id')
        travellers = int(data.get('travellers', 1))

        try:
            travel_date = TravelDealDate.objects.get(id=date_option)
        except TravelDealDate.DoesNotExist:
            return Response({"error": "Invalid date option."}, status=status.HTTP_400_BAD_REQUEST)

        if travel_date.capacity < travellers:
            return Response({"error": "Not enough slots available for this date."}, status=status.HTTP_400_BAD_REQUEST)

        # Reduce capacity safely
        travel_date.capacity -= travellers
        travel_date.save()

        booking = serializer.save()

        return Response(self.get_serializer(booking).data, status=status.HTTP_201_CREATED)


class BookingRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class BookingUpdateAPIView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = True  # allow partial update on PATCH
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class BookingPaymentUpdateAPIView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        data = request.data

        booking.payment_method = data.get("payment_method", booking.payment_method)
        booking.payment_status = "paid"
        booking.payment_date = timezone.now()
        booking.payment_amount = data.get("payment_amount", booking.payment_amount)
        booking.transaction_id = data.get("transaction_id", booking.transaction_id)
        booking.status = "confirmed"
        booking.save()

        # ✅ Send confirmation email
        send_booking_success_email(booking)

        serializer = self.get_serializer(booking)
        return Response(serializer.data)


# --------------------------
# Stripe Payment View
# --------------------------

class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = request.data.get("amount")
            currency = request.data.get("currency", "eur")

            if not amount:
                return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

            amount_in_cents = int(float(amount) * 100)

            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency=currency,
                payment_method_types=["card"],
                description="Travel Booking Payment",
                expand=["charges"],
            )

            return Response({
                "clientSecret": intent.client_secret,
                "paymentIntentId": intent.id,
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --------------------------
# PayPal Payment Verification View
# --------------------------

class VerifyPayPalPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('orderID')
        if not order_id:
            return Response({'error': 'orderID is required'}, status=status.HTTP_400_BAD_REQUEST)

        access_token_url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token'
        order_url = f'https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}'
        auth = (settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET)

        token_resp = requests.post(access_token_url, data={'grant_type': 'client_credentials'}, auth=auth)
        token = token_resp.json().get("access_token")

        if not token:
            return Response({'error': 'Failed to retrieve PayPal token'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        verify_resp = requests.get(order_url, headers={"Authorization": f"Bearer {token}"})
        data = verify_resp.json()

        if data.get("status") == "COMPLETED":
            return Response({"status": "success", "payer_id": data["payer"]["payer_id"]})

        return Response({"error": "Payment not completed"}, status=status.HTTP_400_BAD_REQUEST)


# --------------------------
# Invoice PDF Download
# --------------------------

def download_invoice(request, id):
    try:
        booking = Booking.objects.select_related('travel_deal', 'date_option').get(id=id)
    except Booking.DoesNotExist:
        raise Http404("Booking not found")

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="invoice_{id}.pdf"'

    p = canvas.Canvas(response, pagesize=letter)
    width, height = letter

    left_margin = 50
    y = height - 50
    line_height = 18

    p.setFont("Helvetica-Bold", 20)
    p.drawString(left_margin, y, "Booking Invoice")
    y -= line_height * 2

    p.setFont("Helvetica-Bold", 14)
    p.drawString(left_margin, y, "Order Details")
    y -= line_height

    p.setFont("Helvetica", 12)
    p.drawString(left_margin, y, f"Booking ID: {booking.id}")
    y -= line_height
    p.drawString(left_margin, y, f"Status: {booking.status}")
    y -= line_height
    p.drawString(left_margin, y, f"Purchased On: {booking.created_at.strftime('%Y-%m-%d %H:%M')}")
    y -= line_height
    p.drawString(left_margin, y, f"Payment Status: {booking.payment_status}")
    y -= line_height
    p.drawString(left_margin, y, f"Payment Method: {booking.payment_method or 'N/A'}")
    y -= line_height
    p.drawString(left_margin, y, f"Transaction ID: {booking.transaction_id or 'N/A'}")
    y -= line_height
    p.drawString(left_margin, y, f"Payment Date: {booking.payment_date.strftime('%Y-%m-%d %H:%M') if booking.payment_date else 'N/A'}")
    y -= line_height
    p.drawString(left_margin, y, f"Amount Paid: ${booking.payment_amount or 'N/A'}")
    y -= line_height * 2

    p.setFont("Helvetica-Bold", 14)
    p.drawString(left_margin, y, "Traveller Information")
    y -= line_height

    p.setFont("Helvetica", 12)
    p.drawString(left_margin, y, f"Name: {booking.full_name}")
    y -= line_height
    p.drawString(left_margin, y, f"Email: {booking.email}")
    y -= line_height
    p.drawString(left_margin, y, f"Phone: {booking.phone}")
    y -= line_height
    p.drawString(left_margin, y, f"Address Line 1: {booking.address_line1}")
    y -= line_height
    if booking.address_line2:
        p.drawString(left_margin, y, f"Address Line 2: {booking.address_line2}")
        y -= line_height
    p.drawString(left_margin, y, f"Town: {booking.town}")
    y -= line_height
    p.drawString(left_margin, y, f"State: {booking.state}")
    y -= line_height
    p.drawString(left_margin, y, f"Postcode: {booking.postcode}")
    y -= line_height
    p.drawString(left_margin, y, f"Country: {booking.country}")
    y -= line_height * 2

    p.setFont("Helvetica-Bold", 14)
    p.drawString(left_margin, y, "Booking Details")
    y -= line_height

    p.setFont("Helvetica", 12)
    p.drawString(left_margin, y, f"Travel Deal: {booking.travel_deal.title if booking.travel_deal else 'N/A'}")
    y -= line_height
    if booking.date_option:
        start_date = booking.date_option.start_date.strftime('%Y-%m-%d')
        end_date = booking.date_option.end_date.strftime('%Y-%m-%d')
    else:
        start_date = "N/A"
        end_date = "N/A"
    p.drawString(left_margin, y, f"Travel Dates: {start_date} to {end_date}")
    y -= line_height
    p.drawString(left_margin, y, f"Number of Travellers: {booking.travellers}")
    y -= line_height
    p.drawString(left_margin, y, f"Room Option: {booking.room_option.capitalize() if booking.room_option else 'N/A'}")
    y -= line_height
    p.drawString(left_margin, y, f"Add Transfer: {'Yes' if booking.add_transfer else 'No'}")
    y -= line_height
    p.drawString(left_margin, y, f"Add Nights: {'Yes' if booking.add_nights else 'No'}")
    y -= line_height
    p.drawString(left_margin, y, f"Flight Help: {'Yes' if booking.flight_help else 'No'}")
    y -= line_height
    p.drawString(left_margin, y, f"Donation: {'Yes' if booking.donation else 'No'}")
    y -= line_height * 2

    p.setFont("Helvetica-Oblique", 10)
    p.drawString(left_margin, y, "Thank you for booking with us! Please contact support if you have any questions.")
    p.showPage()
    p.save()

    return response


# --------------------------
# Cancel Booking View
# --------------------------

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
        if booking.can_be_canceled():
            # Free up the date slot
            booking.date_option.capacity += booking.travellers
            booking.date_option.save()

            booking.cancel()

            # ✅ Send cancellation email with manual refund info
            send_booking_cancellation_email(booking)

            return Response({"message": "Booking canceled successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Booking cannot be canceled."}, status=status.HTTP_400_BAD_REQUEST)
    except ObjectDoesNotExist:
        return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)


# --------------------------
# User Reminders View
# --------------------------
class UserRemindersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        upcoming_bookings = Booking.objects.filter(
            user=request.user,
            date_option__start_date__gte=today,
            status__in=['confirmed', 'pending']
        ).order_by('date_option__start_date')

        serializer = BookingSerializer(upcoming_bookings, many=True, context={'request': request})
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_location(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

    lat = request.data.get('latitude')
    lon = request.data.get('longitude')

    if lat is None or lon is None:
        return Response({"detail": "Latitude and longitude required."}, status=status.HTTP_400_BAD_REQUEST)

    location = BookingLocation.objects.create(booking=booking, latitude=lat, longitude=lon)
    serializer = BookingLocationSerializer(location)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_location_history(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

    locations = booking.locations.all()  # related_name='locations'
    serializer = BookingLocationSerializer(locations, many=True)
    return Response(serializer.data)