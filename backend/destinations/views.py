from django.db.models import Avg
from rest_framework import generics
from rest_framework.generics import ListAPIView
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from .models import (
    Region, Country, TravelDeal, Review, Article, FAQ,
    TravelType, DealCategory,
    CountryOverview, CountryLearnMoreTopic, TravelDealDate,
    WishlistItem, ItineraryDay, Place
)
from .serializers import (
    RegionSerializer, CountrySerializer, CountryDetailSerializer,
    TravelDealSerializer, ReviewSerializer, ArticleSerializer,
    FAQSerializer, TravelTypeSerializer, DealCategorySerializer,
    CountryOverviewSerializer, CountryLearnMoreTopicSerializer,
    TravelDealDateSerializer, WishlistItemSerializer, ItineraryDaySerializer,
    PlaceSerializer, TravelDealIncludedSerializer
)
from .permissions import IsSuperUserOrReadOnly

# ================================
# Region Views
# ================================
class RegionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsSuperUserOrReadOnly]

class RegionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsSuperUserOrReadOnly]

# ================================
# Country Views
# ================================
class CountryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsSuperUserOrReadOnly]

class CountryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Country.objects.all()
    serializer_class = CountryDetailSerializer
    permission_classes = [IsSuperUserOrReadOnly]
    lookup_field = 'slug'

# ================================
# Travel Deal Views
# ================================
class TravelDealListAPIView(generics.ListAPIView):
    serializer_class = TravelDealSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        qs = TravelDeal.objects.all()

        filter_type = self.request.query_params.get("filter", "").lower()
        if filter_type == "popular":
            # annotate average rating and order descending
            qs = qs.annotate(avg_rating=Avg("reviews__rating")).order_by("-avg_rating", "-id")
        elif filter_type == "new":
            # order by newest (assuming 'id' or created timestamp available)
            qs = qs.order_by("-id")
        else:
            # default order maybe by title or id
            qs = qs.order_by("title")

        return qs

class TravelDealListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TravelDealSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('slug')
        return TravelDeal.objects.filter(country__slug=country_slug)

class TravelDealRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TravelDealSerializer
    permission_classes = [IsSuperUserOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        country_slug = self.kwargs.get('country_slug')
        return TravelDeal.objects.filter(country__slug=country_slug)

class TravelDealIncludedRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = TravelDealIncludedSerializer
    lookup_field = 'slug'
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('country_slug')
        return TravelDeal.objects.filter(country__slug=country_slug)

    def get_object(self):
        queryset = self.get_queryset()
        slug = self.kwargs.get('deal_slug')
        try:
            return queryset.get(slug=slug)
        except TravelDeal.DoesNotExist:
            raise NotFound("Travel deal not found")

# ================================
# Place Views
# ================================
class PlaceListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = PlaceSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        return Place.objects.all()

class PlaceRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlaceSerializer
    permission_classes = [IsSuperUserOrReadOnly]
    lookup_field = 'pk'

    def get_queryset(self):
        return Place.objects.all()

# ================================
# Itinerary Day Views
# ================================
class ItineraryDayListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItineraryDaySerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        deal_slug = self.kwargs['deal_slug']
        return ItineraryDay.objects.filter(travel_deal__slug=deal_slug).order_by('day_number')

    def perform_create(self, serializer):
        deal_slug = self.kwargs['deal_slug']
        deal = TravelDeal.objects.get(slug=deal_slug)
        serializer.save(travel_deal=deal)

class ItineraryDayRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ItineraryDay.objects.all()
    serializer_class = ItineraryDaySerializer
    permission_classes = [IsSuperUserOrReadOnly]

# ================================
# Review Views
# ================================
class ReviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        deal_slug = self.kwargs.get('deal_slug')
        if deal_slug:
            return Review.objects.filter(travel_deal__slug=deal_slug)
        return Review.objects.all()

    def perform_create(self, serializer):
        deal_slug = self.kwargs.get('deal_slug')
        deal = TravelDeal.objects.get(slug=deal_slug)
        serializer.save(travel_deal=deal)

class ReviewRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        return Review.objects.all()

# ================================
# Article Views
# ================================
class ArticleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsSuperUserOrReadOnly]

class ArticleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsSuperUserOrReadOnly]

# ================================
# FAQ Views
# ================================
class FAQListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FAQSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('slug') or self.kwargs.get('country_slug')
        if country_slug:
            return FAQ.objects.filter(country__slug=country_slug)
        return FAQ.objects.all()

class FAQRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FAQSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('country_slug')
        if country_slug:
            return FAQ.objects.filter(country__slug=country_slug)
        return FAQ.objects.all()

# ================================
# Public Read-Only Destinations API
# ================================
class DestinationsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        regions = Region.objects.prefetch_related('countries').all()
        data = {"regions": []}
        for region in regions:
            countries = CountrySerializer(region.countries.all(), many=True).data
            data["regions"].append({
                "region_name": region.name,
                "countries": countries
            })
        return Response(data)

# ================================
# Travel Type Views
# ================================
class TravelTypeListCreateAPIView(generics.ListCreateAPIView):
    queryset = TravelType.objects.prefetch_related('options').all()
    serializer_class = TravelTypeSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        types = [t['name'] for t in serializer.data]
        options = {t['name']: [opt['name'] for opt in t['options']] for t in serializer.data}
        return Response({"types": types, "options": options})

class TravelTypeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TravelType.objects.prefetch_related('options').all()
    serializer_class = TravelTypeSerializer
    permission_classes = [IsSuperUserOrReadOnly]

# ================================
# Deal Category Views
# ================================
class DealCategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = DealCategory.objects.prefetch_related('offers').all()
    serializer_class = DealCategorySerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        categories = [c['name'] for c in serializer.data]
        offers = {c['name']: [offer['name'] for offer in c['offers']] for c in serializer.data}
        return Response({"categories": categories, "offers": offers})

class DealCategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DealCategory.objects.prefetch_related('offers').all()
    serializer_class = DealCategorySerializer
    permission_classes = [IsSuperUserOrReadOnly]

# ================================
# Country Overview Views
# ================================
class CountryOverviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CountryOverviewSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('slug') or self.kwargs.get('country_slug')
        if country_slug:
            return CountryOverview.objects.filter(country__slug=country_slug)
        return CountryOverview.objects.all()

class CountryOverviewRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CountryOverviewSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('country_slug')
        if country_slug:
            return CountryOverview.objects.filter(country__slug=country_slug)
        return CountryOverview.objects.all()

# ================================
# Country Learn More Topic Views
# ================================
class CountryLearnMoreTopicListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CountryLearnMoreTopicSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('slug') or self.kwargs.get('country_slug')
        if country_slug:
            return CountryLearnMoreTopic.objects.filter(country__slug=country_slug)
        return CountryLearnMoreTopic.objects.all()

class CountryLearnMoreTopicRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CountryLearnMoreTopicSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs.get('country_slug')
        if country_slug:
            return CountryLearnMoreTopic.objects.filter(country__slug=country_slug)
        return CountryLearnMoreTopic.objects.all()

# ================================
# Travel Deal Date Views
# ================================
class TravelDealDateListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TravelDealDateSerializer
    permission_classes = [IsSuperUserOrReadOnly]

    def get_queryset(self):
        country_slug = self.kwargs['country_slug']
        deal_slug = self.kwargs['deal_slug']
        return TravelDealDate.objects.filter(
            travel_deal__slug=deal_slug,
            travel_deal__country__slug=country_slug
        )

    def perform_create(self, serializer):
        country_slug = self.kwargs['country_slug']
        deal_slug = self.kwargs['deal_slug']
        try:
            deal = TravelDeal.objects.get(slug=deal_slug, country__slug=country_slug)
        except TravelDeal.DoesNotExist:
            raise NotFound("Travel deal not found.")
        serializer.save(travel_deal=deal)

class TravelDealDateRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TravelDealDateSerializer
    permission_classes = [IsSuperUserOrReadOnly]
    lookup_field = 'pk'

    def get_queryset(self):
        country_slug = self.kwargs['country_slug']
        deal_slug = self.kwargs['deal_slug']
        return TravelDealDate.objects.filter(
            travel_deal__slug=deal_slug,
            travel_deal__country__slug=country_slug
        )

# ================================
# Wishlist Views
# ================================
class WishlistItemListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WishlistItemDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

# ================================
# Search API for Travel Deals
# ================================
class TravelDealSearchAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TravelDealSerializer

    def get_queryset(self):
        queryset = TravelDeal.objects.all()
        request = self.request

        # Query params
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")
        min_duration = request.query_params.get("min_duration")
        max_duration = request.query_params.get("max_duration")
        sale = request.query_params.get("sale")
        style = request.query_params.getlist("style")
        theme = request.query_params.getlist("theme")
        query = request.query_params.get("query")
        region = request.query_params.get("region")  # ✅ NEW

        # Filter by region
        if region:
            queryset = queryset.filter(country__region__id=region)

        # Filter by search query
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(country__name__icontains=query)
            )

        # Filter by date range
        if start_date and end_date:
            queryset = queryset.filter(
                dates__start_date__gte=start_date,
                dates__end_date__lte=end_date
            ).distinct()

        # Filter by duration
        if min_duration:
            queryset = queryset.filter(days__gte=min_duration)
        if max_duration:
            queryset = queryset.filter(days__lte=max_duration)

        # Filter by price range
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Filter by sale
        if sale == "true":
            queryset = queryset.filter(on_sale=True)

        # Filter by style and theme
        if style:
            queryset = queryset.filter(style__in=style)
        if theme:
            queryset = queryset.filter(themes__overlap=theme)

        return queryset


class GroupTourListView(generics.ListAPIView):
    serializer_class = TravelDealSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TravelDeal.objects.filter(style__iexact="group")
    
    
@api_view(['GET'])
@permission_classes([AllowAny])
def related_countries(request):
    slug = request.GET.get('slug')
    print(f"related_countries called with slug: {slug}")
    
    if not slug:
        return Response({"error": "Slug is required."}, status=400)

    try:
        country = Country.objects.get(slug=slug)
        print("Found country:", country.name, "Region:", country.region)

        related = Country.objects.filter(region=country.region).exclude(id=country.id)
        print("Related countries count:", related.count())

        for r in related:
            print("Related:", r.name)

        serializer = CountrySerializer(related, many=True, context={'request': request})
        return Response(serializer.data)
    except Country.DoesNotExist:
        print("Country not found")
        return Response([], status=200)

class RegionWithCountriesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        regions = Region.objects.prefetch_related("countries").all()
        data = RegionSerializer(regions, many=True, context={"request": request}).data
        return Response(data)