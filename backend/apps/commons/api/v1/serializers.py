from rest_framework import serializers

class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        fields = "__all__"
        read_only_fields = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        audit_fields = [
            "created_at", "updated_at", "deleted_at",
            "created_by", "updated_by", "deleted_by", "is_deleted"
        ]

        existing = []
        for field in audit_fields:
            if field in self.fields:
                existing.append(field)

        for field_name in existing:
            self.fields[field_name].read_only = True
    
    def validate(self, attrs):
        ready_only_fields_sent = []

        for field_name, field in self.fields.items():
            if field.read_only and field_name in self.initial_data:
                ready_only_fields_sent.append(field_name)

        if ready_only_fields_sent:
            errors = {
                field: "Este campe é somente leitura e não pode ser modificado."
                for field in ready_only_fields_sent
            }
            raise serializers.ValidationError(errors)
        
        return attrs