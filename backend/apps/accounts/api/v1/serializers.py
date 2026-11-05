import re
from django.db import transaction
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.accounts.models import *
from apps.commons.api.v1.serializers import BaseSerializer
from apps.locations.api.v1.serializers import AddressSerializer
from apps.locations.models import Address

def _update_user_instance(user_instance, user_data):
    if not user_data:
        return user_instance
    password = user_data.pop("password", None)
    for attr, val in user_data.items():
        setattr(user_instance, attr, val)
    if password:
        user_instance.set_password(password)
    user_instance.save()
    return user_instance

class UserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"validators": []},
        }

    def validate_username(self, value):
        target_instance = self.instance
        if not target_instance and self.parent and getattr(self.parent, 'instance', None):
            target_instance = getattr(self.parent.instance, 'user', None)

        qs = User.objects.filter(username=value)
        if target_instance:
            qs = qs.exclude(pk=target_instance.pk)

        if qs.exists():
            existing_user = qs.first()
            user_name = existing_user.get_full_name() if existing_user else "desconhecido"
            raise serializers.ValidationError(
                f"Este CPF já está cadastrado no sistema (Paciente: {user_name}). "
                "Verifique a lista de pacientes antes de criar um novo registro."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()
        return user

class PatientUserSerializer(BaseSerializer):
    user = UserSerializer()
    conditions = serializers.SerializerMethodField()
    address_obj = AddressSerializer(source="address", read_only=True)

    class Meta(BaseSerializer.Meta):
        model = PatientUser
        fields = '__all__'

    def validate_cpf(self, value):
        """Valida se o CPF já está em uso por outro paciente"""
        if value:
            # Para criação, verifica se CPF já existe
            if not self.instance and PatientUser.objects.filter(cpf=value).exists():
                raise serializers.ValidationError(
                    "Este CPF já está cadastrado no sistema. Verifique a lista de pacientes."
                )
            # Para edição, verifica se CPF já existe em outro paciente
            elif self.instance and PatientUser.objects.filter(cpf=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError(
                    "Este CPF já está cadastrado em outro paciente."
                )
        return value

    def validate_sus(self, value):
        """Valida se o cartão SUS já está em uso por outro paciente"""
        if value:
            # Para criação, verifica se SUS já existe
            if not self.instance and PatientUser.objects.filter(sus=value).exists():
                raise serializers.ValidationError(
                    "Este cartão SUS já está cadastrado no sistema. Verifique a lista de pacientes."
                )
            # Para edição, verifica se SUS já existe em outro paciente
            elif self.instance and PatientUser.objects.filter(sus=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError(
                    "Este cartão SUS já está cadastrado em outro paciente."
                )
        return value

    @extend_schema_field(serializers.CharField())
    def get_conditions(self, obj):
        conditions = []
        try:
            if hasattr(obj, "has") and obj.has is not None:
                conditions.append("HAS")
        except:
            pass
        
        try:
            if hasattr(obj, "dm") and obj.dm is not None:
                conditions.append("DM")
        except:
            pass
        
        try:
            # Evita N+1: se otherdcnt_set estiver no cache de prefetch, usa len() em memória
            if hasattr(obj, '_prefetched_objects_cache') and 'otherdcnt_set' in obj._prefetched_objects_cache:
                has_other = len(obj.otherdcnt_set.all()) > 0
            else:
                has_other = obj.otherdcnt_set.exists()
            if has_other:
                conditions.append("OUTRAS DCNTs")
        except:
            pass

        return " / ".join(conditions) if conditions else None

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        with transaction.atomic():
            user = User.objects.create_user(**user_data)
            patient = PatientUser.objects.create(user=user, **validated_data)
        return patient

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        with transaction.atomic():
            if user_data:
                _update_user_instance(instance.user, user_data)
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()
        return instance

class ProfessionalUserSerializer(BaseSerializer):
    user = UserSerializer()

    class Meta(BaseSerializer.Meta):
        model = ProfessionalUser
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        with transaction.atomic():
            user = User.objects.create_user(**user_data)
            professional = ProfessionalUser.objects.create(user=user, **validated_data)
        return professional

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        with transaction.atomic():
            if user_data:
                _update_user_instance(instance.user, user_data)
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()
        return instance

class ManagerUserSerializer(BaseSerializer):
    user = UserSerializer()

    class Meta(BaseSerializer.Meta):
        model = ManagerUser
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        with transaction.atomic():
            user = User.objects.create_user(**user_data)
            manager = ManagerUser.objects.create(user=user, **validated_data)
        return manager

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        with transaction.atomic():
            if user_data:
                _update_user_instance(instance.user, user_data)
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()
        return instance
