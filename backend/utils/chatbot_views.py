import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings

class TravelChatbotAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_message = request.data.get("message", "").strip()
        if not user_message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            system_prompt = (
                "You are a helpful travel assistant for a travel website. "
                "Answer traveler questions about visa, weather, destinations, tours, "
                "and travel tips clearly and politely."
            )

            prompt = f"System: {system_prompt}\nUser: {user_message}\nAssistant:"

            payload = {
                "model": "gpt-oss:120b-cloud",
                "prompt": prompt,
                "temperature": 0.7,
                "max_tokens": 500,
                "stream": False,
            }

            ollama_host = getattr(settings, "OLLAMA_HOST", "http://127.0.0.1:11435")
            url = f"{ollama_host}/api/generate"
            headers = {"Content-Type": "application/json"}

            # Increased timeout from 30 to 120 seconds
            response = requests.post(url, json=payload, headers=headers, timeout=300)
            response.raise_for_status()
            data = response.json()

            answer = data.get("response", "").strip()

            if not answer:
                return Response({"error": "Empty response from Ollama API"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"response": answer})

        except requests.exceptions.Timeout:
            return Response({"error": "Request to Ollama API timed out."}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Request error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
