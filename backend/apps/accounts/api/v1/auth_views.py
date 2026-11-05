from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.api.v1.serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.utils.utils import get_user_profile
from .auth_serializers import EmailOrUsernameOrCpfTokenObtainPairSerializer

class EmailOrUsernameOrCpfTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameOrCpfTokenObtainPairSerializer
    throttle_scope = 'auth_token'


def _roles_for(user):
    role, _ = get_user_profile(user)
    if role and role in ('manager', 'professional', 'patient'):
        return [role.upper()]
    if user.is_superuser:
        return ["MANAGER"]
    return []

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "user": UserSerializer(request.user).data,
            "roles": _roles_for(request.user)
        })
