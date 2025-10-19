from rest_framework import serializers
from apps.accounts.models import *
from apps.commons.api.v1.serializers import BaseSerializer

class UserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]

class PatientUserSerializer(BaseSerializer):
    user = UserSerializer() 

    class Meta(BaseSerializer.Meta):
        model = PatientUser
        fields = '__all__'

class ProfessionalUserSerializer(BaseSerializer):
    user = UserSerializer() 

    class Meta(BaseSerializer.Meta):
        model = ProfessionalUser
        fields = '__all__'

class ManagerUserSerializer(BaseSerializer):
    user = UserSerializer() 

    class Meta(BaseSerializer.Meta):
        model = ManagerUser
        fields = '__all__'
