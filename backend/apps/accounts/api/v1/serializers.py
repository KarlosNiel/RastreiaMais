from rest_framework import serializers
from apps.accounts.models import *

class PatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientUser
        fields = '__all__'

class ProfessionalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalUser
        fields = '__all__'

class ManagerUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagerUser
        fields = '__all__'
