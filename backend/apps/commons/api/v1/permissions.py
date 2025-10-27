from rest_framework.permissions import BasePermission
from apps.accounts.models import ManagerUser, ProfessionalUser, PatientUser

class BaseRolePermission(BasePermission):

    def get_profile(self, request):
        user = request.user #* Obtém o user da requisição

        if not user.is_authenticated:
            return None
        
        #* Para cada modelo tenta buscar um objeto no qual o user seja o usuário atual
        for model in (PatientUser, ProfessionalUser, ManagerUser):
            try:
                return model.objects.get(user=user)
            except model.DoesNotExist:
                continue
        return None

    #* Metodo que retorna True se o usuário logado for um ManagerUser
    def is_manager(self, request): 
        profile = self.get_profile(request)
        return isinstance(profile, ManagerUser) #* Verifica o tipo do perfil
    
    def is_professional(self, request):
        profile = self.get_profile(request)
        return isinstance(profile, ProfessionalUser)
    
    def is_patient(self, request):
        profile = self.get_profile(request)
        return isinstance(profile, PatientUser)
