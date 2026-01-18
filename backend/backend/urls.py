from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    # ---------------------------
    # Django Admin
    # ---------------------------
    path('admin/', admin.site.urls),

    # ---------------------------
    # JWT Authentication
    # ---------------------------
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ---------------------------
    # Core Application Routes
    # ---------------------------
    path('api/accounts/', include('accounts.urls')),
    path('api/destinations/', include('destinations.urls')),
    path('api/contacts/', include('contacts.urls')),
    path('api/blogs/', include('blogs.urls')),
    path('api/utils/', include('utils.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/admin-dashboard/', include('admin_dashboard.urls')),
]


# ---------------------------
# Static & Media (for dev)
# ---------------------------
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
