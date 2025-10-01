from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from .serializers import PatientUserSerializer, ProfessionalUserSerializer, ManagerUserSerializer

@extend_schema(tags=['Accounts - Patient'])
class PatientUserViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = PatientUser.all_objects
    serializer_class = PatientUserSerializer

@extend_schema(tags=['Accounts - Professional'])
class ProfessionalUserViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = ProfessionalUser.all_objects
    serializer_class = ProfessionalUserSerializer

@extend_schema(tags=['Accounts - Manager'])
class ManagerUserViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = ManagerUser.all_objects
    serializer_class = ManagerUserSerializer
