from rest_framework.permissions import SAFE_METHODS
from apps.commons.permissions import BaseRolePermission

class AlertDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar esse recurso."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            self.message = "Usuário não autenticado!"
            return False
        
        if user.is_superuser or self.is_manager(user):
            return True
        
        if self.is_professional(user):
            return True
        
        if self.is_patient(user):
            self.message = "Pacientes não tem acesso aos alertas..."
            return False
        
        self.message = "Você não tem permissão para acessar está rota."
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser or self.is_manager(user):
            return True
        
        if self.is_professional(user) and request.method in SAFE_METHODS:
            return True
        
        if self.is_professional(user) and request.method not in SAFE_METHODS:
            return getattr(obj, "user", None) == user
        
        if self.is_patient(user):
            self.message = "Pacientes não tem acesso aos alertas..."
            return False
        
        return False
    

