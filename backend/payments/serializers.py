from rest_framework import serializers
from .models import Booking, TravelDeal, TravelDealDate, BookingLocation
from destinations.serializers import TravelDealSerializer, TravelDealDateSerializer

class BookingSerializer(serializers.ModelSerializer):
    # Nested serializers for read operations (frontend display)
    travel_deal = TravelDealSerializer(read_only=True)
    date_option = TravelDealDateSerializer(read_only=True)

    # Accept foreign keys as IDs for write operations
    travel_deal_id = serializers.PrimaryKeyRelatedField(
        queryset=TravelDeal.objects.all(),
        write_only=True,
        source='travel_deal'
    )
    date_option_id = serializers.PrimaryKeyRelatedField(
        queryset=TravelDealDate.objects.all(),
        write_only=True,
        source='date_option'
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',

            # Nested read-only fields
            'travel_deal',
            'date_option',

            # Write-only foreign key IDs
            'travel_deal_id',
            'date_option_id',

            # Personal details
            'full_name',
            'email',
            'phone',
            'address_line1',
            'address_line2',
            'town',
            'state',
            'postcode',
            'country',

            # Booking specifics
            'travellers',
            'room_option',
            'add_transfer',
            'add_nights',
            'flight_help',
            'donation',

            # Payment info
            'payment_method',
            'payment_status',
            'payment_amount',
            'transaction_id',
            'payment_date',

            # Booking status and timestamps
            'status',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'payment_date',
            'transaction_id',
            'payment_status',
        ]

    def validate(self, data):
        instance = getattr(self, 'instance', None)

        # Determine date_option and travellers considering partial updates
        date_option = data.get('date_option') if 'date_option' in data else (instance.date_option if instance else None)
        travellers = data.get('travellers') if 'travellers' in data else (instance.travellers if instance else None)

        # Only validate capacity if creating or updating date_option or travellers
        if (instance is None) or ('date_option' in data) or ('travellers' in data):
            if date_option is not None and travellers is not None:
                if date_option.capacity < travellers:
                    raise serializers.ValidationError("Not enough capacity for the selected date option.")

        return data

    def create(self, validated_data):
        # No capacity reduction here (should be done in view)
        return super().create(validated_data)


class BookingLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingLocation
        fields = ['id', 'latitude', 'longitude', 'timestamp']
        read_only_fields = ['id', 'timestamp']