from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Blog, Comment, Category, Story
from .serializers import BlogSerializer, CommentSerializer, CategorySerializer, StorySerializer

# -------------------------
# Category Views
# -------------------------
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# -------------------------
# Blog Views
# -------------------------
class BlogListCreateView(generics.ListCreateAPIView):
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Blog.objects.filter(status='published').order_by('-created_at')
        country_name = self.request.query_params.get('country')
        if country_name:
            queryset = queryset.filter(country__name=country_name)
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        return Blog.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}

    def get_object(self):
        blog = get_object_or_404(
            Blog.objects.prefetch_related('likes', 'comments__author'),
            slug=self.kwargs['slug']
        )

        session_key = f"viewed_blog_{blog.id}"
        if not self.request.session.get(session_key):
            blog.views += 1
            blog.save(update_fields=['views'])
            self.request.session[session_key] = True

        return blog

# -------------------------
# Comment Views
# -------------------------
class CommentListCreateByBlogView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(blog_id=self.kwargs['blog_id']).order_by('-created_at')

    def perform_create(self, serializer):
        blog = get_object_or_404(Blog, id=self.kwargs['blog_id'])
        serializer.save(author=self.request.user, blog=blog)

class IsCommentAuthor(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.author == request.user

class CommentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsCommentAuthor()]
        return [permissions.AllowAny()]

# -------------------------
# Like Toggle API Views
# -------------------------
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, blog_id):
    blog = get_object_or_404(Blog, id=blog_id)
    user = request.user
    if blog.likes.filter(id=user.id).exists():
        blog.likes.remove(user)
        liked = False
    else:
        blog.likes.add(user)
        liked = True
    return Response({'liked': liked, 'likes_count': blog.likes.count()})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_comment_like(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    user = request.user
    if comment.likes.filter(id=user.id).exists():
        comment.likes.remove(user)
        liked = False
    else:
        comment.likes.add(user)
        liked = True
    return Response({'liked': liked, 'likes_count': comment.likes.count()})

# -------------------------
# Story Views
# -------------------------
class StoryListView(generics.ListAPIView):
    queryset = Story.objects.all().order_by('-created_at')
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        return {'request': self.request}