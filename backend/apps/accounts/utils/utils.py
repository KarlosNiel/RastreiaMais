
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
            except model.MultipleObjectsReturned:
                # Se houver múltiplos registros, retorna o primeiro (mais antigo)
                return model.objects.filter(user=user.created_by).first()
        return None

def get_user_profile(user):
    if not user or not getattr(user, 'is_authenticated', False):
        return None, None

    cached = getattr(user, '_cached_user_profile', None)
    if cached is not None:
        return cached

    result = (None, None)
    if hasattr(user, 'patientuser'):
        result = ('patient', user.patientuser)  
    elif hasattr(user, 'professionaluser'):
        result = ('professional', user.professionaluser)
    elif hasattr(user, 'manageruser'):
        result = ('manager', user.manageruser)
    elif user.is_superuser:
        result = ('superuser', None)

    try:
        user._cached_user_profile = result
    except Exception:
        pass

    return result

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
        