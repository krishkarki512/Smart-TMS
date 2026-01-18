import requests
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings


# ----------------------------------------
# Visa Checker API
# ----------------------------------------
class VisaCheckerAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        nationality = request.data.get('nationality')
        destination = request.data.get('destination')

        if not nationality or not destination:
            return Response(
                {"error": "Both nationality and destination are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clean country codes (ensure uppercase)
        nationality = nationality.upper()
        destination = destination.upper()

        api_url = f"https://rough-sun-2523.fly.dev/visa/{nationality}/{destination}"

        try:
            external_response = requests.get(api_url, timeout=10)

            # Log for debugging
            print(f"[VisaChecker] URL: {api_url}")
            print(f"[VisaChecker] Status: {external_response.status_code}")
            print(f"[VisaChecker] Response: {external_response.text}")

            if external_response.status_code == 200:
                return Response(external_response.json())

            return Response(
                {
                    "error": "Could not fetch visa info from external API.",
                    "status_code": external_response.status_code,
                    "message": external_response.text,
                },
                status=external_response.status_code
            )

        except requests.RequestException as e:
            print(f"[VisaChecker] Exception: {str(e)}")
            return Response(
                {"error": "Failed to connect to Visa API."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


# ----------------------------------------
# Weather Forecast API
# ----------------------------------------
class WeatherForecastAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        city = request.data.get('city')
        if not city:
            return Response({"error": "City is required."}, status=status.HTTP_400_BAD_REQUEST)

        api_key = settings.OPENWEATHER_API_KEY
        if not api_key:
            return Response({"error": "API key not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Get city coordinates
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={api_key}"

        try:
            geo_res = requests.get(geo_url, timeout=5)
            geo_data_list = geo_res.json()
            if geo_res.status_code != 200 or not geo_data_list:
                return Response({"error": "Could not get coordinates for the city."}, status=status.HTTP_400_BAD_REQUEST)

            geo_data = geo_data_list[0]
            lat = geo_data['lat']
            lon = geo_data['lon']
        except requests.RequestException:
            return Response({"error": "Failed to connect to geocoding service."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Get weather forecast using coordinates
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}"

        try:
            forecast_res = requests.get(forecast_url, timeout=5)
            if forecast_res.status_code == 200:
                forecast_data = forecast_res.json()
                forecasts = []
                for item in forecast_data.get('list', []):
                    forecasts.append({
                        "datetime": datetime.utcfromtimestamp(item['dt']).strftime('%Y-%m-%d %H:%M:%S'),
                        "temp": item['main']['temp'],
                        "temp_min": item['main']['temp_min'],
                        "temp_max": item['main']['temp_max'],
                        "description": item['weather'][0]['description'],
                        "humidity": item['main']['humidity'],
                        "wind_speed": item['wind']['speed'],
                        "clouds": item['clouds']['all']
                    })

                return Response({
                    "city": forecast_data['city']['name'],
                    "country": forecast_data['city']['country'],
                    "forecasts": forecasts
                })

            return Response({"error": "Could not fetch forecast data."}, status=forecast_res.status_code)
        except requests.RequestException:
            return Response({"error": "Failed to connect to forecast service."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


# ----------------------------------------
# Currency Exchange Rate API
# ----------------------------------------
class ExchangeRateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        amount = request.data.get('amount')
        from_currency = request.data.get('from_currency')
        to_currency = request.data.get('to_currency')

        if not all([amount, from_currency, to_currency]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            url = f'https://v6.exchangerate-api.com/v6/{settings.EXCHANGE_RATE_API_KEY}/latest/{from_currency.upper()}'
            response = requests.get(url)
            data = response.json()

            if response.status_code != 200 or data.get('result') != 'success':
                return Response({'error': data.get('error-type', 'API request failed')}, status=status.HTTP_400_BAD_REQUEST)

            rates = data.get('conversion_rates', {})
            rate = rates.get(to_currency.upper())

            if rate is None:
                return Response({'error': f'Currency {to_currency} not supported'}, status=status.HTTP_400_BAD_REQUEST)

            result = round(amount * rate, 4)
            return Response({'result': result, 'rate': rate})

        except requests.RequestException:
            return Response({'error': 'Failed to connect to exchange rate service.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
