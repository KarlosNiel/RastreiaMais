from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.api.v1.serializers import UserSerializer
from apps.accounts.models import ManagerUser, ProfessionalUser, PatientUser
from rest_framework_simplejwt.views import TokenObtainPairView
from .auth_serializers import EmailOrUsernameOrCpfTokenObtainPairSerializer

class EmailOrUsernameOrCpfTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameOrCpfTokenObtainPairSerializer


def _roles_for(user):
    roles = []
    if ManagerUser.objects.filter(user=user).exists(): roles.append("MANAGER")
    if ProfessionalUser.objects.filter(user=user).exists(): roles.append("PROFESSIONAL")
    if PatientUser.objects.filter(user=user).exists(): roles.append("PATIENT")
    return roles

class MeView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "user": UserSerializer(request.user).data,
            "roles": _roles_for(request.user)
        })
