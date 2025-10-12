from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.commons.permissions import BaseRolePermission
from apps.commons.utils import get_user_role

class PatientDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar este recurso..."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False
        
        if user.is_superuser:
            return True  

        if self.is_manager(user): #* Gestores podem tudo (acesso à rota)
            return True
        
        if self.is_professional(user): #* profissionais: acesso total à rota .
            return True
        
        if self.is_patient(user) and request.method in SAFE_METHODS: #*pacientes: apenas métodos seguros (leitura)
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if self.is_manager(user):
            return True

        if self.is_professional(user):
            return True
        
        if self.is_patient(user) and request.method in SAFE_METHODS:
            return getattr(obj, 'user', None) == user
        
        return False

class ProfessionalDataPermission(BaseRolePermission):
    message = "Você não tem permissão para acessar este recurso..."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            self.message = "Usuário não autenticado!"
            return False
        
        if user.is_superuser:
            return True 
        
        if self.is_manager(user): 
            return True
        
        if self.is_professional(user) and request.method in SAFE_METHODS:
            return True
        
        if self.is_patient(user):
            self.message = "Pacientes não tem acesso aos dados dos profissionais..."
            return False
        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if self.is_manager(user):
            return True
        
        if self.is_professional(user) and request.method in SAFE_METHODS:
            return getattr(obj, 'user', None) == user
        
        if self.is_patient(user):
            self.message = "Pacientes não tem acesso a este objeto de dados dos profissionais..."
            return False
        
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
        
        if self.is_manager(user) and request.method in SAFE_METHODS:
            return True
        
        self.message = "Você não tem permissão para acessar está rota."
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True
        
        if self.is_manager(user) and request.method in SAFE_METHODS:
            return getattr(obj, 'user', None) == user
        
        return False
        

