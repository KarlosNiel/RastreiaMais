from rest_framework import serializers
from apps.locations.models import Address, MicroArea, Institution

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class MicroAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicroArea
        fields = '__all__'

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'