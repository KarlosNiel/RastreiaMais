# backend/apps/accounts/api/v1/logout_view.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


class LogoutView(APIView):
    """
    Endpoint para logout do usuário.
    Adiciona o refresh token à blacklist para invalidá-lo.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token é obrigatório."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Adiciona o token à blacklist
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"detail": "Logout realizado com sucesso."}, 
                status=status.HTTP_200_OK
            )
            
        except TokenError:
            return Response(
                {"detail": "Token inválido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": "Erro interno do servidor."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )