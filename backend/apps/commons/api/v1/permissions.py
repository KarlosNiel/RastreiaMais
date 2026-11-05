from rest_framework.permissions import BasePermission
from apps.accounts.utils.utils import get_user_profile
from apps.accounts.models import ManagerUser, ProfessionalUser, PatientUser

class BaseRolePermission(BasePermission):

    def get_profile(self, request):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None
        _, profile = get_user_profile(user)
        return profile

    # Metodo que retorna True se o usuário logado for um ManagerUser ou superuser
    def is_manager(self, request): 
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        role, _ = get_user_profile(user)
        return role == 'manager'
    
    def is_professional(self, request):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        role, _ = get_user_profile(user)
        return role == 'professional'
    
    def is_patient(self, request):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        role, _ = get_user_profile(user)
        return role == 'patient'
