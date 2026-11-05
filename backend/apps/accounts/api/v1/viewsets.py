from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
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
    filterset_fields = ['micro_area', 'gender', 'bolsa_familia']
    search_fields = ['user__first_name', 'user__last_name', 'cpf', 'user__username', 'sus', 'phone']
    ordering_fields = ['created_at', 'user__first_name', 'age']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'], url_path='check-cpf')
    def check_cpf(self, request):
        """Verifica se um CPF já está cadastrado no sistema (Apenas Gestores, Profissionais e Admins)"""
        role, profile = get_user_profile(request.user)
        if role == 'patient':
            return Response(
                {"detail": "Pacientes não têm permissão para consultar status de outros CPFs."},
                status=status.HTTP_403_FORBIDDEN
            )

        cpf = request.query_params.get('cpf', '').strip()
        
        if not cpf:
            return Response(
                {"error": "CPF não fornecido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verifica se existe um User com esse username (CPF)
        user_exists = User.objects.filter(username=cpf).exists()
        
        # Verifica se existe um PatientUser com esse CPF
        patient_exists = PatientUser.objects.filter(cpf=cpf).exists()
        
        exists = user_exists or patient_exists
        
        response_data = {
            "cpf": cpf,
            "exists": exists,
            "message": "CPF já cadastrado no sistema" if exists else "CPF disponível"
        }
        
        if exists:
            # Busca informações do paciente
            try:
                patient = PatientUser.objects.get(cpf=cpf)
                response_data["patient"] = {
                    "id": patient.id,
                    "name": patient.user.get_full_name(),
                }
            except PatientUser.DoesNotExist:
                # Pode ser que o User exista mas não o PatientUser
                try:
                    user = User.objects.get(username=cpf)
                    response_data["user"] = {
                        "id": user.id,
                        "name": user.get_full_name(),
                    }
                except User.DoesNotExist:
                    pass
        
        return Response(response_data, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = super().get_queryset().select_related(
            'user',
            'address',
            'has',
            'dm',
        ).prefetch_related(
            'otherdcnt_set',
        )
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
        queryset = super().get_queryset().select_related('user')
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
        queryset = super().get_queryset().select_related('user')
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'manager':
            return queryset.filter(id=profile.id)

        if role == 'superuser':
            return queryset

        return queryset.none()   
