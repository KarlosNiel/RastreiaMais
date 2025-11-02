from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .serializers import PatientUserSerializer, ProfessionalUserSerializer, ManagerUserSerializer
from .permissions import PatientDataPermission, ProfessionalDataPermission, ManagerDataPermission
from apps.accounts.utils.utils import get_user_profile

@extend_schema(tags=['Accounts - Patient'])
class PatientUserViewset(BaseModelViewSet):
    queryset = PatientUser.all_objects
    serializer_class = PatientUserSerializer    
    permission_classes = [IsAuthenticated, PatientDataPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'patient':
            return queryset.filter(id=profile.id)

        if role == 'professional' or role == 'manager' or role == 'superuser':
            return queryset

        return queryset.none()    
    

@extend_schema(tags=['Accounts - Professional'])
class ProfessionalUserViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, ProfessionalDataPermission]
    queryset = ProfessionalUser.all_objects
    serializer_class = ProfessionalUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'professional':
            return queryset.filter(id=profile.id)

        if role == 'manager' or role == 'superuser':
            return queryset

        return queryset.none()   

@extend_schema(tags=['Accounts - Manager'])
class ManagerUserViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, ManagerDataPermission]
    queryset = ManagerUser.all_objects
    serializer_class = ManagerUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'manager':
            return queryset.filter(id=profile.id)

        if role == 'superuser':
            return queryset

        return queryset.none()   
