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