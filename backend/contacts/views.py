from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        messages = ContactMessage.objects.all().order_by('-created_at')
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Message received successfully!"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
