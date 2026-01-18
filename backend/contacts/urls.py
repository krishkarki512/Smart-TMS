from django.urls import path
from .views import ContactMessageAPI

urlpatterns = [
    path('messages/', ContactMessageAPI.as_view(), name='contact-messages'),
]
