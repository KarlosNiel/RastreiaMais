from rest_framework.permissions import SAFE_METHODS
from apps.commons.api.v1.permissions import BaseRolePermission

class PendenciesDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar esse recurso."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False
        
        if user.is_superuser or self.is_manager(request):
            return True
        
        if self.is_professional(request):
            return True
        
        if self.is_patient(request) and request.method in SAFE_METHODS:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser or self.is_manager(request):
            return True
        
        if self.is_professional(request):
            return getattr(obj, "user", None) == user
        
        if self.is_patient(request):
            return getattr(obj, "user", None) == user
        
        return False