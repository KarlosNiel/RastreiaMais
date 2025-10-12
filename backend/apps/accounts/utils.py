
from django.core.exceptions import ValidationError

def get_creator_profile(user):  #* retorna o tipo de user que criou o objeto
        if not user.created_by:
            return None #* se created_by não estiver definino retorna None
    
        from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
        
        for model in [PatientUser, ProfessionalUser, ManagerUser]:
            try:
                return model.objects.get(user=user.created_by)
            except model.DoesNotExist:
                continue 
        return None


class SingleProfileMixin: #* Mixin para permitir apenas a criação de um tipo de perfil por user

    def clean(self):
        super().clean() 
        '''
        Chama a implementação clean() da classe pai (se existir). Isso garante que validações definidas 
        em classes base sejam executadas antes da validação customizada do mixin.
        '''
        
        if not self.user:
            return
        
        from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser #! Evita problemas de importação circular

        existing_profiles = []
        for model in [PatientUser, ProfessionalUser, ManagerUser]:
            if model != type(self) and model.objects.filter(user=self.user).exists():
                existing_profiles.append(model.__name__)

        if existing_profiles:
            raise ValidationError(f"Esse usuário já possui um outro perfil {', '.join(existing_profiles)}.")
        