from rest_framework import serializers
from apps.conditions.models import HAS, DM, OtherDCNT

class HASSerializer(serializers.ModelSerializer):
    class Meta:
        model = HAS
        fields = '__all__'

class DMSerializer(serializers.ModelSerializer):
    class Meta:
        model = DM
        fields = '__all__'

class OtherDCNTSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherDCNT
        fields = '__all__'
        
            