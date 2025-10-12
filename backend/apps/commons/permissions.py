from rest_framework.permissions import BasePermission

class BaseRolePermission(BasePermission):
    def is_manager(self, user): 
        return hasattr(user, 'manager')
    
    def is_professional(self, user):
        return hasattr(user, 'professional')
    
    def is_patient(self, user):
        return hasattr(user, 'patient')