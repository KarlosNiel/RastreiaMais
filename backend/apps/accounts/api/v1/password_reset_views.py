from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apps.accounts.models_password_reset import PasswordResetToken
from .password_reset_serializers import (
    PasswordResetRequestSerializer,
    PasswordResetValidateSerializer,
    PasswordResetConfirmSerializer
)


class PasswordResetRequestView(APIView):
    """
    Endpoint para solicitar recuperação de senha.
    Aceita email, username ou CPF.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={
            200: OpenApiResponse(description="Email enviado com sucesso (se o usuário existir)"),
            400: OpenApiResponse(description="Dados inválidos"),
        },
        tags=["Password Reset"],
        description="Solicita recuperação de senha. Por segurança, sempre retorna sucesso mesmo se o usuário não existir."
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.get_user()

        # Por segurança, sempre retornamos sucesso
        # mesmo se o usuário não existir
        if user and user.email:
            # Invalida tokens anteriores não usados
            PasswordResetToken.objects.filter(
                user=user,
                used=False,
                expires_at__gt=timezone.now()
            ).update(used=True, used_at=timezone.now())

            # Cria novo token
            reset_token = PasswordResetToken.objects.create(user=user)

            # Monta o link de recuperação
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_link = f"{frontend_url}/auth/redefinir-senha?token={reset_token.token}"

            # Envia email
            try:
                send_mail(
                    subject='Recuperação de Senha - Rastreia+',
                    message=f"""
Olá {user.get_full_name() or user.username},

Você solicitou a recuperação de senha no sistema Rastreia+.

Para redefinir sua senha, clique no link abaixo:
{reset_link}

Este link expira em 24 horas.

Se você não solicitou esta recuperação, ignore este email.

Atenciosamente,
Equipe Rastreia+
                    """.strip(),
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@rastreiamais.com'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log do erro (em produção, usar logging adequado)
                print(f"Erro ao enviar email: {e}")

        return Response({
            'message': 'Se o email informado estiver cadastrado, você receberá instruções para recuperação de senha.'
        }, status=status.HTTP_200_OK)


class PasswordResetValidateView(APIView):
    """
    Endpoint para validar um token de recuperação.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetValidateSerializer,
        responses={
            200: OpenApiResponse(description="Token válido"),
            400: OpenApiResponse(description="Token inválido ou expirado"),
        },
        tags=["Password Reset"],
        description="Valida se um token de recuperação é válido e não expirou."
    )
    def post(self, request):
        serializer = PasswordResetValidateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        token_str = serializer.validated_data['token']

        try:
            token = PasswordResetToken.objects.select_related('user').get(token=token_str)
            
            if not token.is_valid():
                return Response({
                    'valid': False,
                    'message': 'Token inválido ou expirado.'
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'valid': True,
                'email': token.user.email,
                'username': token.user.username
            }, status=status.HTTP_200_OK)

        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Token não encontrado.'
            }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Endpoint para confirmar a nova senha.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={
            200: OpenApiResponse(description="Senha alterada com sucesso"),
            400: OpenApiResponse(description="Token inválido ou senha fraca"),
        },
        tags=["Password Reset"],
        description="Confirma a nova senha usando o token de recuperação."
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        token_str = serializer.validated_data['token']
        new_password = serializer.validated_data['password']

        try:
            token = PasswordResetToken.objects.select_related('user').get(token=token_str)
            
            if not token.is_valid():
                return Response({
                    'message': 'Token inválido ou expirado.'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = token.user

            # Valida a senha usando os validadores do Django
            try:
                validate_password(new_password, user=user)
            except DjangoValidationError as e:
                return Response({
                    'password': list(e.messages)
                }, status=status.HTTP_400_BAD_REQUEST)

            # Atualiza a senha
            user.set_password(new_password)
            user.save()

            # Marca o token como usado
            token.mark_as_used()

            return Response({
                'message': 'Senha alterada com sucesso!'
            }, status=status.HTTP_200_OK)

        except PasswordResetToken.DoesNotExist:
            return Response({
                'message': 'Token não encontrado.'
            }, status=status.HTTP_400_BAD_REQUEST)
