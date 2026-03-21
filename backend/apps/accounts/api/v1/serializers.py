from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.accounts.models import *
from apps.commons.api.v1.serializers import BaseSerializer
from apps.locations.api.v1.serializers import AddressSerializer
from apps.locations.models import Address

class UserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_username(self, value):
        # Check if username already exists (only for creation)
        if not self.instance and User.objects.filter(username=value).exists():
            # Busca informações do usuário existente
            existing_user = User.objects.filter(username=value).first()
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
            if obj.otherdcnt_set.exists():
                conditions.append("OUTRAS DCNTs")
        except:
            pass

        return " / ".join(conditions) if conditions else None

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
