from rest_framework import permissions

def is_admin(user):
    """Check if user is admin"""
    if not user or not user.is_authenticated:
        return False
    # Admin is identified by email or is_staff flag
    return user.email == 'adminvpaa@gmail.com' or user.is_staff or user.is_superuser

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows:
    - Admins: Full CRUD access
    - Others: Read-only access
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user)

class IsAdmin(permissions.BasePermission):
    """
    Permission class that only allows admin access
    """
    def has_permission(self, request, view):
        return is_admin(request.user)

class IsParticipantOrAdmin(permissions.BasePermission):
    """
    Permission class that allows:
    - Admins: Full access
    - Participants: Can only access their own data
    """
    def has_permission(self, request, view):
        if is_admin(request.user):
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        
        # Participants can only access their own participant records
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'participant') and hasattr(obj.participant, 'user'):
            return obj.participant.user == request.user
        
        return False

