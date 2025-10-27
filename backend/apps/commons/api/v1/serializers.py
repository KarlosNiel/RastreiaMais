from rest_framework import serializers
from apps.commons.api.v1.utils import single_profile_validation

class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        fields = "__all__"
        read_only_fields = [] #* lista para os campos so de leitura

    def __init__(self, *args, **kwargs): #! Marca campos de auditoria como somente leitura
        super().__init__(*args, **kwargs)

        audit_fields = [
            "created_at", "updated_at", "deleted_at",
            "created_by", "updated_by", "deleted_by", "is_deleted"
        ] #* campos de auditoria

        existing = [] #* lista para guarda se os campos realmente existem no modelo
        for field in audit_fields:
            if field in self.fields:
                existing.append(field) 
        
        #* Se esses campos existirem no modelo, eles são automaticamente marcados como read_only
        for field_name in existing:
            self.fields[field_name].read_only = True
            
    def update(self, instance, validated_data): #! Função para resolver o problema do nested update
        user_data = validated_data.pop("user", None) # *Remove os dados do campo user do validated_data

        #* Atualiza o modelo principal
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        #* Atualiza o User, se tiver vindo no payload
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        return instance

    def validate(self, attrs): #! Bloqueia alterações indevidas e valida perfis únicos
        ready_only_fields_sent = []

        if hasattr(self, "initial_data"): #* contém os dados crus enviados pelo cliente antes da validação
            for field_name, field in self.fields.items():
                #* detecta se o cliente tentou enviar valores para campos que são read_only
                if field.read_only and field_name in self.initial_data:
                    ready_only_fields_sent.append(field_name)

        if ready_only_fields_sent:
            #* Se tentou enviar, lança o erro.
            errors = {
                field: "Este campe é somente leitura e não pode ser modificado."
                for field in ready_only_fields_sent
            }
            raise serializers.ValidationError(errors)
        
        user_data = attrs.get("user") #* Garante que o usuário não tenha dois perfis do mesmo tipo
        if user_data and isinstance(user_data, dict):
            #* Se user_data for um dicionário (caso o User ainda não tenha sido salvo), ele pula a validação
            pass
        else:
            #* Se ja existe no banco, ele valida que user nao tenha outro perfil igual
            single_profile_validation(user_data, self.Meta.model)

        return attrs