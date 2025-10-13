from rest_framework import serializers
from apps.accounts.models import *
from apps.commons.api.v1.serializers import BaseSerializer

class PatientUserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = PatientUser
        fields = '__all__'

class ProfessionalUserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ProfessionalUser
        fields = '__all__'

class ManagerUserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ManagerUser
        fields = '__all__'
