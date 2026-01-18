from rest_framework import serializers
from django.conf import settings
from .models import Category, Blog, Comment, Story
from destinations.models import Country

# -------------------------
# Category Serializer
# -------------------------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


# -------------------------
# Blog Serializer
# -------------------------
class BlogSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    # For writing (input): accept country ID
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    
    # For reading (output): nested category data
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'content', 'thumbnail', 'category', 'category_details',
            'created_at', 'updated_at', 'status', 'tags', 'views',
            'likes_count', 'is_liked', 'author', 'country'
        ]

    def get_author(self, obj):
        request = self.context.get('request')
        profile_image_url = (
            request.build_absolute_uri(obj.author.profile_image.url)
            if obj.author.profile_image
            else None
        )
        return {
            "id": obj.author.id,
            "username": obj.author.username,
            "profile_image": profile_image_url
        }

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        return user.is_authenticated and obj.likes.filter(id=user.id).exists()

    def get_likes_count(self, obj):
        return obj.likes.count()


# -------------------------
# Comment Serializer
# -------------------------
class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    blog = serializers.PrimaryKeyRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'blog', 'author', 'text', 'created_at', 'parent',
            'replies', 'is_liked', 'likes_count',
        ]
        read_only_fields = [
            'blog', 'author', 'created_at', 'replies', 'is_liked', 'likes_count'
        ]

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
        }

    def get_replies(self, obj):
        queryset = obj.replies.all().order_by('created_at')
        return CommentSerializer(queryset, many=True, context=self.context).data

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_likes_count(self, obj):
        return obj.likes.count()

# -------------------------
# Story Serializer
# -------------------------
class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = "__all__"