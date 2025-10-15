from rest_framework.permissions import SAFE_METHODS
from apps.commons.permissions import BaseRolePermission

class LocationsDataPermissions(BaseRolePermission):
    message = "Você não tem permissão para acessar esse recurso."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False
        
        if user.is_superuser or self.is_manager(user):
            return True
        
        if self.is_professional(user):
            self.message = "Profissionais não tem permissão para acessar está rota."
            return False
        
        if self.is_patient(user):
            self.message = "Pacientes não tem permissão para acessar está rota."
            return False
        
    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False
        
        if user.is_superuser or self.is_manager(user):
            return True
        
        if self.is_professional(user):
            self.message = "Profissioanis não tem acesso as localidades..."
            return False
        
        if self.is_patient(user):
            self.message = "Pacientes não tem acesso as localidades..."
            return False
        
        return False
        
        
