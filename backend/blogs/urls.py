from django.urls import path
from .views import (
    BlogListCreateView,
    BlogDetailView,
    CommentListCreateByBlogView,
    CommentRetrieveUpdateDestroyView,
    toggle_like,
    toggle_comment_like,
    CategoryListView,
    StoryListView,
)

urlpatterns = [
    # Story endpoints (specific) — moved up before slug
    path('stories/', StoryListView.as_view(), name='story-list'),

    # Category endpoint (specific)
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # Comments endpoints (specific)
    path('<int:blog_id>/comments/', CommentListCreateByBlogView.as_view(), name='blog-comments'),
    path('comments/<int:pk>/', CommentRetrieveUpdateDestroyView.as_view(), name='comment-detail'),

    # Like toggles (specific)
    path('<int:blog_id>/toggle-like/', toggle_like, name='toggle-blog-like'),
    path('comments/<int:comment_id>/toggle-like/', toggle_comment_like, name='toggle-comment-like'),

    # Blog endpoints
    path('', BlogListCreateView.as_view(), name='blog-list-create'),

    # Slug catch-all MUST come last
    path('<slug:slug>/', BlogDetailView.as_view(), name='blog-detail'),
]
