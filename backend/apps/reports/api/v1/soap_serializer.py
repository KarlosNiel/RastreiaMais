from rest_framework import serializers


class SOAPGenerateRequestSerializer(serializers.Serializer):
    """Serializer para request de geração de SOAP."""
    patient_id = serializers.IntegerField(
        help_text="ID do PatientUser para gerar o relatório SOAP."
    )


class SOAPAssistRequestSerializer(serializers.Serializer):
    """Serializer para request de assistência clínica por IA para SOAP."""
    patient_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID do PatientUser (se já cadastrado)."
    )
    base_soap = serializers.DictField(
        required=False,
        allow_null=True,
        help_text="Objeto SOAP base em rascunho (para pacientes em preenchimento)."
    )
    professional_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Notas ou queixas adicionais do profissional de saúde para a IA incorporar."
    )

    def validate(self, attrs):
        if not attrs.get("patient_id") and not attrs.get("base_soap"):
            raise serializers.ValidationError(
                "Informe ao menos 'patient_id' ou 'base_soap' para o aprimoramento do SOAP."
            )
        return attrs



class SOAPIndicadorSerializer(serializers.Serializer):
    """Indicador do Previne Brasil."""
    indicador = serializers.CharField()
    status = serializers.CharField()


class SOAPPacienteSerializer(serializers.Serializer):
    """Metadata do paciente no relatório."""
    id = serializers.IntegerField()
    nome = serializers.CharField()
    cpf = serializers.CharField(allow_null=True)
    nascimento = serializers.CharField(allow_null=True)
    idade = serializers.IntegerField(allow_null=True)


class SOAPSubjetivoSerializer(serializers.Serializer):
    """Bloco S — Subjetivo."""
    identificacao = serializers.CharField()
    historico = serializers.CharField()
    determinantes = serializers.CharField(allow_blank=True)
    estilo_vida = serializers.CharField()


class SOAPObjetivoSerializer(serializers.Serializer):
    """Bloco O — Objetivo."""
    pressao_arterial = serializers.CharField(required=False, allow_null=True)
    antropometria = serializers.CharField(required=False, allow_null=True)
    glicemia_metabolico = serializers.CharField(required=False, allow_null=True)
    exame_fisico = serializers.CharField(required=False, allow_null=True)


class SOAPAvaliacaoSerializer(serializers.Serializer):
    """Bloco A — Avaliação."""
    hipertensao = serializers.CharField(required=False, allow_null=True)
    diabetes = serializers.CharField(required=False, allow_null=True)
    risco_cardiovascular = serializers.CharField(required=False, allow_null=True)
    riscos_psicossociais = serializers.CharField(required=False, allow_null=True)
    outras_dcnts = serializers.CharField(required=False, allow_null=True)


class SOAPPlanoSerializer(serializers.Serializer):
    """Bloco P — Plano."""
    conduta_clinica = serializers.CharField(required=False, allow_null=True)
    exames_solicitados = serializers.CharField(required=False, allow_null=True)
    encaminhamentos = serializers.CharField(required=False, allow_null=True)


class SOAPReportResponseSerializer(serializers.Serializer):
    """Response completo do relatório SOAP."""
    paciente = SOAPPacienteSerializer()
    subjetivo = SOAPSubjetivoSerializer()
    objetivo = SOAPObjetivoSerializer()
    avaliacao = SOAPAvaliacaoSerializer()
    plano = SOAPPlanoSerializer()
    indicadores_previne = SOAPIndicadorSerializer(many=True)
    gerado_em = serializers.CharField()
    alertas_clinicos = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    sugestoes_conduta = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    is_ai_enhanced = serializers.BooleanField(required=False, default=False)
    ai_disclaimer = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=None
    )
