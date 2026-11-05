from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.viewsets import GenericViewSet
from apps.commons.api.v1.permissions import BaseRolePermission


class BaseModelViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, mixins.UpdateModelMixin,
                        mixins.RetrieveModelMixin, mixins.ListModelMixin, GenericViewSet):

    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = None
    serializer_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(qs.model, 'is_deleted') and getattr(self, 'action', None) not in ('restore_object', 'hard_delete_object'):
            include_deleted = False
            if hasattr(self, 'request') and self.request:
                include_deleted = self.request.query_params.get('include_deleted', '').lower() in ('true', '1')
            if not include_deleted:
                qs = qs.filter(is_deleted=False)
        return qs

    def perform_create(self, serializer):
        extra_data = {}
        if 'created_by' in serializer.fields:
            extra_data['created_by'] = self.request.user

        serializer.save(**extra_data)

    def perform_update(self, serializer):
        extra_data = {}
        if 'updated_by' in serializer.fields:
            extra_data['updated_by'] = self.request.user

        serializer.save(**extra_data)

    def perform_destroy(self, instance):
        if hasattr(instance, "deleted_by"):
            instance.deleted_by = self.request.user
            instance.save(update_fields=["deleted_by"])

        instance.delete()

    @action(detail=True, methods=["patch"], url_path='restore')
    def restore_object(self, request, pk=None):
        user = request.user
        role_perm = BaseRolePermission()

        if not user.is_superuser and not role_perm.is_manager(request):
            return Response(
                {"detail": "Apenas superusuários e gestores podem usar o restore."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
