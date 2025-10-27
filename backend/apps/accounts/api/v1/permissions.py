from rest_framework.permissions import SAFE_METHODS
from apps.commons.api.v1.permissions import BaseRolePermission

class PatientDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar este recurso..."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False
        
        if user.is_superuser or self.is_manager(request):#* Gestores podem tudo (acesso à rota)
            return True  
        
        if self.is_professional(request): #* profissionais: acesso total à rota .
            return True
        
        if self.is_patient(request) and request.method in SAFE_METHODS: #*pacientes: apenas métodos seguros (leitura)
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser or self.is_manager(request):
            return True

        if self.is_professional(request):
            return True
        
        if self.is_patient(request) and request.method in SAFE_METHODS:
            return getattr(obj, 'user', None) == user
        
        return False

class ProfessionalDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar este recurso..."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            self.message = "Usuário não autenticado!"
            return False
        
        if user.is_superuser or self.is_manager(request): 
            return True 
        
        if self.is_professional(request) and request.method in SAFE_METHODS:
            return True
        
        if self.is_patient(request):
            self.message = "Pacientes não tem acesso aos dados dos profissionais..."
            return False
        
        self.message = "Você não tem permissão para acessar está rota."        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser or self.is_manager(request):
            return True
        
        if self.is_professional(request) and request.method in SAFE_METHODS:
            return getattr(obj, 'user', None) == request.user
        
        if self.is_patient(request):
            self.message = "Pacientes não tem acesso a este objeto de dados dos profissionais..."
            return False
        
        self.message = "Você não tem permissão para acessar está rota."
        return False

class ManagerDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar este recurso..."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            self.message = "Usuário não autenticado."
            return False

        if request.method == "POST" and not user.is_superuser:
            self.message = "Apenas superusuários podem criar gestores..."
            return False
        
        if user.is_superuser:
            return True
        
        if self.is_manager(request) and request.method in SAFE_METHODS:
            return True
        
        self.message = "Você não tem permissão para acessar está rota."
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True
        
        if self.is_manager(request) and request.method in SAFE_METHODS:
            return getattr(obj, 'user', None) == request.user
        
        return False
        

