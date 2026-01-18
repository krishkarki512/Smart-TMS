from django.contrib import admin
from django.utils.html import format_html
from django.core.exceptions import ValidationError
from .models import (
    Region, Country, TravelType, TravelOption,
    DealCategory, DealOffer, Place,
    TravelDeal, TravelImage, ItineraryDay,
    WishlistItem, Review, Article, FAQ,
    CountryOverview, CountryLearnMoreTopic,
    TravelDealDate,
)

# ----- Region Admin -----
@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_count')
    search_fields = ('name',)

    def country_count(self, obj):
        return obj.countries.count()
    country_count.short_description = "Number of Countries"


# ----- Country Admin -----
@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'code', 'currency_code', 'thumbnail')
    list_filter = ('region',)
    search_fields = ('name', 'code', 'currency_code')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('thumbnail',)
    fieldsets = (
        (None, {
            'fields': ('region', 'name', 'code', 'currency_code', 'slug')
        }),
        ('Content', {
            'fields': ('subtitle', 'section_title', 'description', 'image', 'thumbnail', 'video'),
            'classes': ('collapse',)
        }),
    )

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:70px; height:auto; border-radius:5px;" />', obj.image.url)
        return "-"
    thumbnail.short_description = "Image"


# ----- TravelType Admin -----
@admin.register(TravelType)
class TravelTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'option_count')
    search_fields = ('name',)

    def option_count(self, obj):
        return obj.options.count()
    option_count.short_description = "Options"


# ----- TravelOption Admin -----
@admin.register(TravelOption)
class TravelOptionAdmin(admin.ModelAdmin):
    list_display = ('name', 'travel_type')
    list_filter = ('travel_type',)
    search_fields = ('name', 'travel_type__name')


# ----- DealCategory Admin -----
@admin.register(DealCategory)
class DealCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'discount_percent', 'offer_count')
    search_fields = ('name',)

    def offer_count(self, obj):
        return obj.offers.count()
    offer_count.short_description = "Offers"


# ----- DealOffer Admin -----
@admin.register(DealOffer)
class DealOfferAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'category__name')


# ----- Place Admin -----
@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'thumbnail')
    search_fields = ('name',)
    readonly_fields = ('thumbnail',)

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:70px; height:auto; border-radius:5px;" />', obj.image.url)
        return "-"
    thumbnail.short_description = "Image"


# ----- TravelDeal Inline for TravelImage and ItineraryDay -----
class TravelImageInline(admin.TabularInline):
    model = TravelImage
    extra = 1
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:100px; height:auto; border-radius:5px;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Image Preview"


class ItineraryDayInline(admin.TabularInline):
    model = ItineraryDay
    extra = 1
    fields = ('day_number', 'location', 'accommodation', 'activities_display', 'meals_display', 'description')
    readonly_fields = ('activities_display', 'meals_display')

    def activities_display(self, obj):
        return ", ".join(obj.activities) if obj.activities else "-"
    activities_display.short_description = "Activities"

    def meals_display(self, obj):
        return ", ".join(obj.meals) if obj.meals else "-"
    meals_display.short_description = "Meals"


# ----- TravelDeal Admin -----
@admin.register(TravelDeal)
class TravelDealAdmin(admin.ModelAdmin):
    list_display = ('title', 'country', 'category', 'price', 'days', 'on_sale', 'last_minute', 'image_preview')
    list_filter = ('country', 'category', 'on_sale', 'last_minute')
    search_fields = ('title', 'country__name', 'category__name', 'city', 'tag', 'style')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('places',)
    inlines = [TravelImageInline, ItineraryDayInline]
    readonly_fields = ('image_preview',)

    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'country', 'category', 'places', 'city', 'days', 'price', 'discount_percent', 'on_sale', 'last_minute')
        }),
        ('Description & Media', {
            'fields': ('subtitle', 'description', 'image', 'image_preview', 'themes', 'tag', 'style'),
            'classes': ('collapse',)
        }),
        ('Inclusions & Exclusions (JSON)', {
            'fields': ('included_json', 'not_included_json'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:120px; height:auto; border-radius:8px;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Cover Image"


# ----- WishlistItem Admin -----
@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'deal', 'added_at')
    search_fields = ('user__email', 'deal__title')
    list_filter = ('added_at',)
    readonly_fields = ('added_at',)


# ----- Review Admin -----
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'travel_deal', 'rating', 'travel_date', 'submitted_on')
    list_filter = ('rating', 'submitted_on')
    search_fields = ('name', 'travel_deal__title', 'title')
    date_hierarchy = 'submitted_on'


# ----- Article Admin -----
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'country', 'location', 'is_inspirational', 'is_suggested', 'image_preview')
    list_filter = ('country', 'is_inspirational', 'is_suggested')
    search_fields = ('title', 'country__name', 'location')
    readonly_fields = ('image_preview',)
    fieldsets = (
        (None, {
            'fields': ('country', 'title', 'location', 'description', 'image', 'image_preview')
        }),
        ('Flags', {
            'fields': ('is_inspirational', 'is_suggested'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:120px; height:auto; border-radius:8px;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Image"


# ----- FAQ Admin -----
@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('country', 'question_preview')
    search_fields = ('country__name', 'question', 'answer')

    def question_preview(self, obj):
        preview = obj.question[:75]
        if len(obj.question) > 75:
            preview += '...'
        return preview
    question_preview.short_description = "Question Preview"


# ----- CountryOverview Admin -----
@admin.register(CountryOverview)
class CountryOverviewAdmin(admin.ModelAdmin):
    list_display = ('country', 'capital', 'population', 'currency', 'language', 'timezone')
    search_fields = ('country__name', 'capital', 'currency', 'language')


# ----- CountryLearnMoreTopic Admin -----
@admin.register(CountryLearnMoreTopic)
class CountryLearnMoreTopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'country', 'order', 'image_preview')
    list_filter = ('country',)
    search_fields = ('title', 'country__name')
    readonly_fields = ('image_preview',)
    ordering = ('order',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:100px; height:auto; border-radius:6px;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Image"


# ----- TravelDealDate Admin -----
@admin.register(TravelDealDate)
class TravelDealDateAdmin(admin.ModelAdmin):
    list_display = ('travel_deal', 'start_date', 'end_date', 'language', 'guaranteed', 'rooms', 'original_price', 'discounted_price', 'discount_percent', 'capacity')
    list_filter = ('language', 'guaranteed', 'rooms')
    search_fields = ('travel_deal__title',)
    date_hierarchy = 'start_date'
    readonly_fields = ('discount_percent',)

    fieldsets = (
        (None, {
            'fields': ('travel_deal', 'start_date', 'end_date', 'language', 'guaranteed', 'rooms', 'capacity')
        }),
        ('Pricing', {
            'fields': ('original_price', 'discounted_price', 'discount_percent'),
        }),
    )
