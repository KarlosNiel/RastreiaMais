from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.commons.utils import get_user_role
from .serializers import PatientUserSerializer, ProfessionalUserSerializer, ManagerUserSerializer
from .permissions import PatientDataPermission, ProfessionalDataPermission, ManagerDataPermission

@extend_schema(tags=['Accounts - Patient'])
class PatientUserViewset(viewsets.ModelViewSet):
    queryset = PatientUser.all_objects
    serializer_class = PatientUserSerializer    
    permission_classes = [IsAuthenticated, PatientDataPermission]
    
    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'manager'):
            return PatientUser.all_objects.all()
        
        if hasattr(user, 'professional'):
            return PatientUser.objects.all()
        
        if hasattr(user, 'patient'):
            return PatientUser.objects.filter(user=user)
        
        return PatientUser.objects.none()

@extend_schema(tags=['Accounts - Professional'])
class ProfessionalUserViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, ProfessionalDataPermission]

    queryset = ProfessionalUser.all_objects
    serializer_class = ProfessionalUserSerializer

@extend_schema(tags=['Accounts - Manager'])
class ManagerUserViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, ManagerDataPermission]

    queryset = ManagerUser.all_objects
    serializer_class = ManagerUserSerializer
