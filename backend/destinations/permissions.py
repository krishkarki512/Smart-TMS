from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSuperUserOrReadOnly(BasePermission):
    """
    Allows full access to superusers, read-only for others.
    """
    def has_permission(self, request, view):
        # Allow read-only methods for any request
        if request.method in SAFE_METHODS:
            return True
        # Write methods only for superusers
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)
