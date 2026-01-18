from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model, password_validation
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserOTP
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    NewsletterSubscriberSerializer
)

User = get_user_model()

# ----------------------------------------
# 🔐 Google OAuth Login
# ----------------------------------------

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Token missing"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

        email = idinfo["email"]
        username = idinfo.get("name", email.split("@")[0])

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": username, "is_active": True}
        )

        if created:
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username
            },
        })


# ----------------------------------------
# 🔐 Registration with OTP Email Verification
# ----------------------------------------

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            otp_code = get_random_string(length=6, allowed_chars='0123456789')
            UserOTP.objects.create(user=user, otp=otp_code, otp_type='email_verification')

            subject = "Your OTP Code"
            message = (
                f"Hello {user.username},\n\n"
                f"Your OTP code is: {otp_code}\n\n"
                "Please enter this code to verify your email and activate your account.\n\n"
                "Thank you!"
            )
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.email]

            try:
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            except Exception as e:
                user.delete()  # Cleanup user
                return Response(
                    {"error": f"Failed to send OTP email: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {"message": "Registration successful. OTP sent to your email."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------------------
# ✅ Unified OTP Verification (Register / Reset)
# ----------------------------------------

class UnifiedOTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        mode = request.data.get("mode")  # "register" or "reset"

        if not email or not otp or mode not in ("register", "reset"):
            return Response({"error": "Missing or invalid data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        otp_type = "email_verification" if mode == "register" else "password_reset"

        try:
            user_otp = UserOTP.objects.filter(user=user, otp=otp, otp_type=otp_type).latest("created_at")
        except UserOTP.DoesNotExist:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        if user_otp.is_expired():
            return Response({"error": "OTP expired."}, status=status.HTTP_400_BAD_REQUEST)

        if mode == "register":
            if user.is_active:
                return Response({"message": "Account already verified."})
            user.is_active = True
            user.is_email_verified = True
            user.save()
            UserOTP.objects.filter(user=user, otp_type='email_verification').delete()
            return Response({"message": "Account successfully activated."})

        return Response({"message": "OTP verified. Proceed to reset password."})


# ----------------------------------------
# 👤 User Profile (Retrieve/Update)
# ----------------------------------------

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ----------------------------------------
# 🔄 Change Password (Authenticated)
# ----------------------------------------

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                password_validation.validate_password(new_password, user=user)
            except Exception as e:
                return Response({"error": list(e)}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({"message": "Password changed successfully"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------------------
# 🔐 Password Reset: Request via OTP
# ----------------------------------------

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Always return success to avoid email enumeration
                return Response({"message": "If that email is registered, an OTP has been sent."})

            otp = get_random_string(length=6, allowed_chars='0123456789')
            UserOTP.objects.create(user=user, otp=otp, otp_type='password_reset')

            subject = "Password Reset OTP"
            message = (
                f"Hello {user.username},\n\n"
                f"Your password reset OTP is: {otp}\nIt expires in 10 minutes.\n\n"
                f"If you didn't request this, please ignore this email."
            )
            try:
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
            except Exception as e:
                return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"message": "If that email is registered, an OTP has been sent."})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------------------
# 🔐 Password Reset: Confirm New Password
# ----------------------------------------

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password has been reset successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----------------------------------------
# 📰 Newsletter Subscription
# ----------------------------------------

class NewsletterSubscriptionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = NewsletterSubscriberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Subscribed to newsletter successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
