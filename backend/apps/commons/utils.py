from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser

def get_user_role(user):
    if hasattr(user, 'manager'):
        return 'manager'
    
    if hasattr(user, 'professional'):
        return 'professional'
    
    if hasattr(user, 'patient'):
        return 'patient'
    
    return None



