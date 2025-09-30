from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import PendencySerializer
from apps.pendencies.models import Pendency

class PendencyViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = Pendency.all_objects
    serializer_class = PendencySerializer