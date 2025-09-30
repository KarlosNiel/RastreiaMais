from rest_framework import serializers
from apps.pendencies.models import Pendency

class PendencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pendency
        fields = '__all__'

        