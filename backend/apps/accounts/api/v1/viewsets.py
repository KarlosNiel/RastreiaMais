from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .serializers import PatientUserSerializer, ProfessionalUserSerializer, ManagerUserSerializer
from .permissions import PatientDataPermission, ProfessionalDataPermission, ManagerDataPermission

@extend_schema(tags=['Accounts - Patient'])
class PatientUserViewset(BaseModelViewSet):
    queryset = PatientUser.all_objects
    serializer_class = PatientUserSerializer    
    permission_classes = [IsAuthenticated, PatientDataPermission]
    

@extend_schema(tags=['Accounts - Professional'])
class ProfessionalUserViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, ProfessionalDataPermission]

    queryset = ProfessionalUser.all_objects
    serializer_class = ProfessionalUserSerializer

@extend_schema(tags=['Accounts - Manager'])
class ManagerUserViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, ManagerDataPermission]

    queryset = ManagerUser.all_objects
    serializer_class = ManagerUserSerializer
