from django.urls import path
from .views import VisaCheckerAPI, WeatherForecastAPI, ExchangeRateAPIView
from .chatbot_views import TravelChatbotAPIView

urlpatterns = [
    path('visa-checker/', VisaCheckerAPI.as_view(), name='visa-checker'),
    path('weather-forecast/', WeatherForecastAPI.as_view(), name='weather-forecast'),
    path('exchange-rate/', ExchangeRateAPIView.as_view(), name='exchange-rate'),
    path('chatbot/', TravelChatbotAPIView.as_view(), name='travel-chatbot'),
]
