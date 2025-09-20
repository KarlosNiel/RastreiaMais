
def get_creator_profile(user):  #* retorna o tipo de user que criou o objeto
        if not user.created_by:
            return None #* se created_by não estiver definino retorna None
    
        from accounts.models import PatientUser, ProfessionalUser, ManagerUser
        
        for model in [PatientUser, ProfessionalUser, ManagerUser]:
            try:
                return model.objects.get(user=user.created_by)
            except model.DoesNotExist:
                continue 
        return None