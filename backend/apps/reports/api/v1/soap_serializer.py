from rest_framework import serializers


class SOAPGenerateRequestSerializer(serializers.Serializer):
    """Serializer para request de geração de SOAP."""
    patient_id = serializers.IntegerField(
        help_text="ID do PatientUser para gerar o relatório SOAP."
    )


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
