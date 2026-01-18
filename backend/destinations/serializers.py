from rest_framework import serializers
import json
from django.db.models import Avg
from .models import (
    Region, Country, TravelDeal, TravelImage, Review, Article, FAQ,
    TravelOption, TravelType, DealCategory, DealOffer,
    CountryOverview, CountryLearnMoreTopic, TravelDealDate,
    WishlistItem, Place, ItineraryDay
)


# -------------------------
# Custom Field for JSON List
# -------------------------
class JSONListField(serializers.Field):
    """
    Custom field to handle JSON stored as list strings in the model.
    Parses JSON strings into Python lists and vice versa.
    """
    def to_internal_value(self, data):
        if isinstance(data, list):
            return data
        if isinstance(data, str):
            try:
                parsed = json.loads(data)
                if isinstance(parsed, list):
                    return parsed
                else:
                    raise serializers.ValidationError("Expected a list of values.")
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format.")
        raise serializers.ValidationError("Invalid data type.")

    def to_representation(self, value):
        return value


# -------------------------
# Basic Serializers
# -------------------------
class CountrySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    region = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Country
        fields = ['id', 'name', 'slug', 'image', 'region']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

class RegionSerializer(serializers.ModelSerializer):
    countries = CountrySerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'countries']


class TravelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelImage
        fields = ['id', 'image']


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['id', 'name', 'image']




# -------------------------
# TravelDealDate Serializer with validation on price fields
# -------------------------
class TravelDealDateSerializer(serializers.ModelSerializer):
    effective_discount = serializers.SerializerMethodField()

    class Meta:
        model = TravelDealDate
        fields = [
            'id', 'start_date', 'end_date', 'language', 'guaranteed',
            'rooms', 'original_price', 'discounted_price',
            'discount_percent', 'capacity', 'effective_discount'
        ]

    def get_effective_discount(self, obj):
        """
        Priority-based discount logic: 
        Prefer TravelDealDate's discount → else TravelDeal's discount → else DealCategory default
        """
        try:
            if obj.original_price and obj.discounted_price:
                original = float(str(obj.original_price).replace(",", "").replace("€", "").strip())
                discounted = float(str(obj.discounted_price).replace(",", "").replace("€", "").strip())
                if original > 0 and discounted < original:
                    percent = round((original - discounted) / original * 100)
                    return {
                        "percent": f"{percent}%",
                        "discounted_price": f"{discounted}€"
                    }
        except Exception:
            pass
        return {
            "percent": None,
            "discounted_price": None
        }


# -------------------------
# TravelDeal Serializer
# -------------------------
class TravelDealSerializer(serializers.ModelSerializer):
    themes = JSONListField()
    country = CountrySerializer(read_only=True)
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), write_only=True, source='country'
    )
    gallery = TravelImageSerializer(many=True, read_only=True)
    places = PlaceSerializer(many=True, read_only=True)
    place_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Place.objects.all(),
        write_only=True,
        source='places'
    )

    average_rating = serializers.SerializerMethodField()
    effective_discount = serializers.SerializerMethodField()
    dates = TravelDealDateSerializer(many=True, read_only=True)  # Include deal dates

    class Meta:
        model = TravelDeal
        fields = "__all__"

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            avg_rating = reviews.aggregate(avg=Avg('rating'))['avg']
            return round(avg_rating, 1) if avg_rating else 0
        return 0

    def get_effective_discount(self, obj):
        """
        Compute the best discount (highest %) from associated TravelDealDate objects.
        """
        best_discount = None
        for date in obj.dates.all():
            try:
                original = float(str(date.original_price).replace(",", "").replace("€", "").strip())
                discounted = float(str(date.discounted_price).replace(",", "").replace("€", "").strip())
                if original > 0 and discounted < original:
                    percent = round((original - discounted) / original * 100)
                    if not best_discount or percent > best_discount['percent']:
                        best_discount = {
                            'percent': percent,
                            'discounted_price': f"{discounted}€"
                        }
            except Exception:
                continue

        return best_discount or {"percent": None, "discounted_price": None}


# Serializer to expose included/not included JSON fields conveniently
class TravelDealIncludedSerializer(serializers.ModelSerializer):
    included = serializers.SerializerMethodField()
    not_included = serializers.SerializerMethodField()

    class Meta:
        model = TravelDeal
        fields = ['included', 'not_included']

    def get_included(self, obj):
        return obj.included

    def get_not_included(self, obj):
        return obj.not_included


# -------------------------
# Itinerary Day Serializer
# -------------------------
class ItineraryDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryDay
        fields = [
            'id',
            'travel_deal',
            'day_number',
            'location',
            'description',
            'accommodation',
            'meals',
            'activities',
        ]


# -------------------------
# Wishlist Item Serializer
# -------------------------
class WishlistItemSerializer(serializers.ModelSerializer):
    deal_title = serializers.CharField(source='deal.title', read_only=True)
    deal_image = serializers.ImageField(source='deal.image', read_only=True)
    deal_country_slug = serializers.SlugField(source='deal.country.slug', read_only=True)
    deal_price = serializers.CharField(source='deal.price', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'deal', 'deal_title', 'deal_image', 'deal_country_slug', 'deal_price']


# -------------------------
# Review Serializer
# -------------------------
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['travel_deal', 'submitted_on']


# -------------------------
# Article Serializer
# -------------------------
class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"


# -------------------------
# FAQ Serializer
# -------------------------
class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = "__all__"


# -------------------------
# Country Overview Serializer
# -------------------------
class CountryOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CountryOverview
        fields = [
            'id', 'capital', 'population', 'currency',
            'language', 'timezone', 'calling_code', 'electricity'
        ]


# -------------------------
# Country Learn More Topic Serializer
# -------------------------
class CountryLearnMoreTopicSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CountryLearnMoreTopic
        fields = ['id', 'title', 'description', 'image_url', 'order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


# -------------------------
# Detailed Country Serializer with nested relations
# -------------------------
class CountryDetailSerializer(serializers.ModelSerializer):
    video = serializers.SerializerMethodField()
    deals = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    articles = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    overview = CountryOverviewSerializer(read_only=True)
    learn_more_topics = CountryLearnMoreTopicSerializer(many=True, read_only=True)
    region = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all())
    inspirations = serializers.SerializerMethodField()
    suggested_articles = serializers.SerializerMethodField()

    class Meta:
        model = Country
        fields = [
            "id", "name", "slug", "subtitle", "section_title",
            "description", "image", "code", "currency_code", "video", "region",
            "deals", "reviews", "articles", "faqs",
            "overview", "learn_more_topics",
            "inspirations", "suggested_articles",
        ]

    def get_video(self, obj):
        request = self.context.get('request')
        if obj.video and request:
            return request.build_absolute_uri(obj.video.url)
        return None

    def get_deals(self, obj):
        return TravelDealSerializer(obj.deals.all(), many=True, context=self.context).data

    def get_reviews(self, obj):
        deals = obj.deals.all()
        reviews = Review.objects.filter(travel_deal__in=deals)
        return ReviewSerializer(reviews, many=True).data

    def get_articles(self, obj):
        return ArticleSerializer(obj.articles.all(), many=True, context=self.context).data

    def get_faqs(self, obj):
        return FAQSerializer(obj.faqs.all(), many=True).data

    def get_inspirations(self, obj):
        return ArticleSerializer(obj.articles.filter(is_inspirational=True), many=True, context=self.context).data

    def get_suggested_articles(self, obj):
        return ArticleSerializer(obj.articles.filter(is_suggested=True), many=True, context=self.context).data


# -------------------------
# Travel Option and Type Serializers with nested create/update
# -------------------------
class TravelOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelOption
        fields = ['name']


class TravelTypeSerializer(serializers.ModelSerializer):
    options = TravelOptionSerializer(many=True)

    class Meta:
        model = TravelType
        fields = ['name', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        travel_type = TravelType.objects.create(**validated_data)
        for option_data in options_data:
            TravelOption.objects.create(travel_type=travel_type, **option_data)
        return travel_type

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        if options_data is not None:
            instance.options.all().delete()
            for option_data in options_data:
                TravelOption.objects.create(travel_type=instance, **option_data)

        return instance


# -------------------------
# Deal Offer and Category Serializers with nested create/update
# -------------------------
class DealOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealOffer
        fields = ['name']


class DealCategorySerializer(serializers.ModelSerializer):
    offers = DealOfferSerializer(many=True)

    class Meta:
        model = DealCategory
        fields = ['name', 'offers']

    def create(self, validated_data):
        offers_data = validated_data.pop('offers', [])
        deal_category = DealCategory.objects.create(**validated_data)
        for offer_data in offers_data:
            DealOffer.objects.create(category=deal_category, **offer_data)
        return deal_category

    def update(self, instance, validated_data):
        offers_data = validated_data.pop('offers', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        if offers_data is not None:
            instance.offers.all().delete()
            for offer_data in offers_data:
                DealOffer.objects.create(category=instance, **offer_data)

        return instance