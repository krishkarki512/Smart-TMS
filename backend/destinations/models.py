from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError
import json


# -------------------------
# Region and Country Models
# -------------------------
class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Country(models.Model):
    region = models.ForeignKey(Region, related_name="countries", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=2, blank=True, null=True)  # ISO country code (e.g. "US")
    currency_code = models.CharField(max_length=3, blank=True, null=True)  # e.g. "USD"
    slug = models.SlugField(unique=True, blank=True)
    subtitle = models.CharField(max_length=200, blank=True)
    section_title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='countries/', blank=True, null=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)

    class Meta:
        unique_together = ('region', 'name')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.region.name})"


# -------------------------
# Travel Types and Options
# -------------------------
class TravelType(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class TravelOption(models.Model):
    travel_type = models.ForeignKey(TravelType, related_name="options", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


# -------------------------
# Deal Categories and Offers
# -------------------------
class DealCategory(models.Model):
    name = models.CharField(max_length=100)
    discount_percent = models.CharField(max_length=10, blank=True, null=True, help_text="e.g. '15%' for category discount")

    def __str__(self):
        return self.name


class DealOffer(models.Model):
    category = models.ForeignKey(DealCategory, related_name="offers", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


# -------------------------
# Place Model
# -------------------------
class Place(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to="places/", blank=True, null=True)

    def __str__(self):
        return self.name


# -------------------------
# Travel Deal and Related Models
# -------------------------
class TravelDeal(models.Model):
    country = models.ForeignKey(Country, related_name="deals", on_delete=models.CASCADE)
    category = models.ForeignKey(DealCategory, related_name='deals', on_delete=models.SET_NULL, null=True, blank=True)
    places = models.ManyToManyField(Place, related_name="deals", blank=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    map_zoom = models.PositiveIntegerField(default=5)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True)
    days = models.PositiveIntegerField()
    price = models.CharField(max_length=20)
    image = models.ImageField(upload_to="deals/cover/", null=True, blank=True)
    themes = models.JSONField(default=list, blank=True)
    tag = models.CharField(max_length=50, blank=True)
    style = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True, null=True)
    on_sale = models.BooleanField(default=False)
    last_minute = models.BooleanField(default=False)

    discount_percent = models.CharField(max_length=10, blank=True, null=True, help_text="e.g. '10%' for deal-wide discount")

    # Stored as JSON string, accessed via properties below
    included_json = models.TextField(blank=True, default='[]')
    not_included_json = models.TextField(blank=True, default='[]')

    @property
    def included(self):
        try:
            return json.loads(self.included_json)
        except json.JSONDecodeError:
            return []

    @included.setter
    def included(self, value):
        self.included_json = json.dumps(value)

    @property
    def not_included(self):
        try:
            return json.loads(self.not_included_json)
        except json.JSONDecodeError:
            return []

    @not_included.setter
    def not_included(self, value):
        self.not_included_json = json.dumps(value)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.country.name}"


class TravelImage(models.Model):
    deal = models.ForeignKey(TravelDeal, related_name="gallery", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="deals/gallery/")

    def __str__(self):
        return f"Image for {self.deal.title}"


class ItineraryDay(models.Model):
    travel_deal = models.ForeignKey(TravelDeal, related_name='itinerary', on_delete=models.CASCADE)
    day_number = models.PositiveIntegerField()
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    accommodation = models.CharField(max_length=200, blank=True)
    activities = models.JSONField(default=list, blank=True)  # list of strings
    meals = models.JSONField(default=list, blank=True)       # list of strings

    class Meta:
        ordering = ['day_number']

    def __str__(self):
        return f"{self.travel_deal.title} - Day {self.day_number}"


# -------------------------
# Wishlist and Reviews
# -------------------------
class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    deal = models.ForeignKey(TravelDeal, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'deal')

    def __str__(self):
        return f"{self.user.email} → {self.deal.title}"


class Review(models.Model):
    travel_deal = models.ForeignKey(TravelDeal, related_name="reviews", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    rating = models.IntegerField()
    content = models.TextField()
    travel_date = models.CharField(max_length=50)
    submitted_on = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.name} on {self.travel_deal.title} - {self.rating}/5"


# -------------------------
# Articles and FAQs
# -------------------------
class Article(models.Model):
    country = models.ForeignKey(Country, related_name="articles", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='articles/', blank=True, null=True)

    # Flags for special sections
    is_inspirational = models.BooleanField(default=False)  # for "Get inspired"
    is_suggested = models.BooleanField(default=False)      # for "You might also like"

    def __str__(self):
        return f"{self.title} ({self.country.name})"


class FAQ(models.Model):
    country = models.ForeignKey(Country, related_name="faqs", on_delete=models.CASCADE)
    question = models.TextField()
    answer = models.TextField()

    def __str__(self):
        preview = self.question[:50]
        if len(self.question) > 50:
            preview += '...'
        return f"FAQ for {self.country.name}: {preview}"


# -------------------------
# Country Overview and Learn More Topics
# -------------------------
class CountryOverview(models.Model):
    country = models.OneToOneField(Country, related_name="overview", on_delete=models.CASCADE)
    capital = models.CharField(max_length=100)
    population = models.CharField(max_length=100)
    currency = models.CharField(max_length=50)
    language = models.CharField(max_length=100)
    timezone = models.CharField(max_length=50)
    calling_code = models.CharField(max_length=20)
    electricity = models.TextField()

    def __str__(self):
        return f"Overview of {self.country.name}"


class CountryLearnMoreTopic(models.Model):
    country = models.ForeignKey(Country, related_name="learn_more_topics", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="learn_more_images/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)  # for ordering topics

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} - {self.country.name}"


# -------------------------
# Travel Deal Dates
# -------------------------
class TravelDealDate(models.Model):
    travel_deal = models.ForeignKey(TravelDeal, related_name="dates", on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    language = models.CharField(max_length=100)
    guaranteed = models.BooleanField(default=False)
    rooms = models.CharField(max_length=100)
    original_price = models.CharField(max_length=50, blank=True, null=True)  # in €
    discounted_price = models.CharField(max_length=50)  # in €
    discount_percent = models.CharField(max_length=10, blank=True, null=True)
    capacity = models.PositiveIntegerField(default=0, help_text="Maximum number of people allowed for this date")

    def save(self, *args, **kwargs):
        """
        Calculate and set discount_percent based on prices if not set manually.
        """
        if self.original_price and self.discounted_price:
            try:
                original = float(self.original_price.replace(",", "").replace("€", "").strip())
                discounted = float(self.discounted_price.replace(",", "").replace("€", "").strip())
                if original > 0 and discounted < original:
                    percent = round((original - discounted) / original * 100)
                    self.discount_percent = f"{percent}%"
                else:
                    self.discount_percent = None
            except ValueError:
                raise ValidationError("Prices must be numeric.")
        else:
            self.discount_percent = None

        super().save(*args, **kwargs)

    def get_effective_discount(self):
        """
        Calculate the effective discount and discounted price based on priority:
          1. Date discount_percent (self.discount_percent)
          2. Deal discount_percent (self.travel_deal.discount_percent)
          3. Category discount_percent (self.travel_deal.category.discount_percent)
          4. No discount
        Returns tuple: (discount_percent_str or None, discounted_price_float or None)
        """
        def parse_price(price_str):
            try:
                return float(price_str.replace("€", "").replace(",", "").strip())
            except Exception:
                return None

        def parse_percent(percent_str):
            try:
                return float(percent_str.replace("%", "").strip())
            except Exception:
                return 0

        original_price = parse_price(self.original_price)
        if original_price is None:
            return None, None

        # Priority 1: Date discount
        if self.discount_percent:
            discount_value = parse_percent(self.discount_percent)
            discounted_price = original_price * (1 - discount_value / 100)
            return self.discount_percent, round(discounted_price, 2)

        # Priority 2: Deal discount
        deal_discount_str = getattr(self.travel_deal, 'discount_percent', None)
        if deal_discount_str:
            discount_value = parse_percent(deal_discount_str)
            if discount_value > 0:
                discounted_price = original_price * (1 - discount_value / 100)
                return deal_discount_str, round(discounted_price, 2)

        # Priority 3: Category discount
        category = getattr(self.travel_deal, 'category', None)
        if category and getattr(category, 'discount_percent', None):
            discount_value = parse_percent(category.discount_percent)
            if discount_value > 0:
                discounted_price = original_price * (1 - discount_value / 100)
                return category.discount_percent, round(discounted_price, 2)

        # No discount
        return None, original_price

    def __str__(self):
        return f"{self.travel_deal.title} ({self.start_date} → {self.end_date})"
