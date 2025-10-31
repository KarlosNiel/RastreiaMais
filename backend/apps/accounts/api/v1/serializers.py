from rest_framework import serializers
from apps.accounts.models import *
from apps.commons.api.v1.serializers import BaseSerializer

class UserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        
        if password:
            user.set_password(password)

        user.save()
        return user

class PatientUserSerializer(BaseSerializer):
    user = UserSerializer() 

    class Meta(BaseSerializer.Meta):
        model = PatientUser
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user = User.objects.create_user(**user_data)
        patient = PatientUser.objects.create(user=user, **validated_data)

        return patient

class ProfessionalUserSerializer(BaseSerializer):
    user = UserSerializer() 

    class Meta(BaseSerializer.Meta):
        model = ProfessionalUser
        fields = '__all__'

    
    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user = User.objects.create_user(**user_data)
        professional = ProfessionalUser.objects.create(user=user, **validated_data)

        return professional

class ManagerUserSerializer(BaseSerializer):
    user = UserSerializer() 

    class Meta(BaseSerializer.Meta):
        model = ManagerUser
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user = User.objects.create_user(**user_data)
        manager = ManagerUser.objects.create(user=user, **validated_data)
    
        return manager
