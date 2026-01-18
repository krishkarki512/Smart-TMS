from django.urls import path
from .views import (
    RegisterView,
    UnifiedOTPVerifyView,
    UserProfileView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    GoogleLoginView,
    NewsletterSubscriptionView
)

urlpatterns = [

    # --------------------
    # Authentication & Registration
    # --------------------
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', UnifiedOTPVerifyView.as_view(), name='verify-otp'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),

    # --------------------
    # User Profile
    # --------------------
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # --------------------
    # Password Reset
    # --------------------
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # --------------------
    # Newsletter Subscription
    # --------------------
    path('newsletter/subscribe/', NewsletterSubscriptionView.as_view(), name='newsletter-subscribe'),
]
