from rest_framework.permissions import SAFE_METHODS
from apps.commons.api.v1.permissions import BaseRolePermission

class AlertDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar esse recurso."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            self.message = "Usuário não autenticado!"
            return False
        
        if user.is_superuser or self.is_manager(request):
            return True
        
        if self.is_professional(request):
            return True
        
        if self.is_patient(request):
            self.message = "Pacientes não tem acesso aos alertas..."
            return False
        
        self.message = "Você não tem permissão para acessar está rota."
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser or self.is_manager(request):
            return True
        
        if self.is_professional(request) and request.method:
            return True
    
        if self.is_patient(request):
            self.message = "Pacientes não tem acesso aos alertas..."
            return False
        
        return False
    

