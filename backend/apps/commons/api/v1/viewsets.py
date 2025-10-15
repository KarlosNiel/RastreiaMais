from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.viewsets import GenericViewSet
from rest_framework import serializers

class BaseModelViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, mixins.UpdateModelMixin, 
                        mixins.RetrieveModelMixin, mixins.ListModelMixin, GenericViewSet):
    
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = None
    serializer_class = None

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete(user=self.request.user)

    @action(detail=True, methods=["patch"], url_path='restore')
    def restore_object(self, request, pk=None):
        instance = self.get_object()
        instance.restore(user=request.user)
        return Response({"detail": "Objeto restaurado com sucesso."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["delete"], url_path='hard-delete')
    def hard_delete_object(self, request, pk=None):
        user = request.user

        if not user.is_superuser:
            return Response(
                {"detail": "Apenas superusuários podem realizar o hard-delete."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        instance.hard_delete()
        return Response(
            {"detail": "Objeto Deletado Permanentemente!"}, 
            status=status.HTTP_200_OK
        )

