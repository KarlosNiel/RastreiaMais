from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import MagicMock, patch
from apps.accounts.models import PatientUser, ProfessionalUser
from apps.conditions.models import HAS, DM
from apps.reports.soap_ai_service import (
    deidentify_soap_payload,
    consultar_diretriz_clinica_aps,
    consultar_rename_aps,
    verificar_indicadores_previne_brasil,
    fetch_patient_clinical_context_from_db,
    _polish_field_prose,
    generate_ai_assisted_soap,
)


@override_settings(GEMINI_API_KEY="")
class SOAPAiAssistServiceTest(APITestCase):

    def test_clinical_tools_execution(self):
        # Tool 1: Diretrizes
        has_guideline = consultar_diretriz_clinica_aps("HAS")
        self.assertIn("Metas Pressóricas", has_guideline)
        dm_guideline = consultar_diretriz_clinica_aps("DM")
        self.assertIn("HbA1c", dm_guideline)

        # Tool 2: RENAME
        rename_has = consultar_rename_aps("hipertensao")
        self.assertIn("Losartana", rename_has)
        self.assertIn("Enalapril", rename_has)
        rename_dm = consultar_rename_aps("diabetes")
        self.assertIn("Metformina", rename_dm)

        # Tool 3: Previne Brasil
        previne = verificar_indicadores_previne_brasil(
            tem_has=True, tem_dm=True, pa_registrada_no_semestre=True, hba1c_solicitada_no_semestre=False
        )
        self.assertIn("Indicador HAS: ATINGIDO", previne)
        self.assertIn("Indicador DM: PENDENTE", previne)

    def test_deidentification_pipeline(self):
        sample_soap = {
            "paciente": {
                "id": 99,
                "nome": "João da Silva Sauro",
                "cpf": "123.456.789-00",
                "nascimento": "01/01/1970",
                "idade": 54,
            },
            "subjetivo": {
                "identificacao": "Paciente Masculino, 54 anos, Parda, Pedreiro.",
                "historico": "Histórico familiar positivo para HAS.",
                "determinantes": "Estresse interfere.",
                "estilo_vida": "Tabagismo: NUNCA FUMOU.",
            },
            "objetivo": {
                "pressao_arterial": "1ª aferição: 160/100 mmHg.",
            },
            "avaliacao": {
                "hipertensao": "HAS — classificação: Hipertenso Estágio 2.",
            },
            "plano": {
                "conduta_clinica": "acompanhamento na APS.",
            },
            "indicadores_previne": [],
        }

        deidentified = deidentify_soap_payload(sample_soap, professional_notes="Queixa de cefaleia matinal.")
        
        # PII não deve estar presente no payload anonimizado
        self.assertNotIn("João da Silva Sauro", str(deidentified))
        self.assertNotIn("123.456.789-00", str(deidentified))
        self.assertIn("54", str(deidentified))
        self.assertEqual(deidentified["paciente_anonimo"]["idade_anos"], 54)
        self.assertEqual(deidentified["observacoes_adicionais_profissional"], "Queixa de cefaleia matinal.")

    def test_ai_enrichment_fallback_deterministic(self):
        sample_soap = {
            "paciente": {
                "id": 1,
                "nome": "Maria Santos",
                "cpf": "000.000.000-00",
                "nascimento": "01/01/1965",
                "idade": 59,
            },
            "subjetivo": {
                "identificacao": "Paciente Feminino, 59 anos.",
                "historico": "",
                "determinantes": "",
                "estilo_vida": "",
            },
            "objetivo": {
                "pressao_arterial": "160/100 mmHg — Hipertenso Estágio 2",
            },
            "avaliacao": {
                "hipertensao": "HAS Estágio 2",
            },
            "plano": {
                "conduta_clinica": "",
                "exames_solicitados": "",
            },
            "indicadores_previne": [],
        }

        # Com chave de API vazia ou ausente, preserva o SOAP do banco/formulário e separa sugestões
        result = generate_ai_assisted_soap(sample_soap, professional_notes="Tosse seca com anti-hipertensivo")
        self.assertTrue(result["is_ai_enhanced"])
        self.assertIn("Assistente Sofia", result["ai_disclaimer"])
        self.assertTrue(len(result["alertas_clinicos"]) > 0)
        self.assertTrue(len(result["sugestoes_conduta"]) > 0)
        self.assertTrue(len(result["sugestoes_exames"]) > 0)
        self.assertTrue(len(result["sugestoes_encaminhamentos"]) > 0)
        self.assertIn("Tosse seca", result["subjetivo"]["identificacao"])
        # Não inventa exames ou condutas dentro do bloco Plano quando não preenchidos
        self.assertEqual(result["plano"]["conduta_clinica"], "")
        self.assertEqual(result["plano"]["exames_solicitados"], "")

    @patch("google.genai.Client")
    def test_gemini_chat_function_calling_flow(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client
        mock_chat = MagicMock()
        mock_client.chats.create.return_value = mock_chat
        mock_response = MagicMock()
        mock_response.text = (
            '{"subjetivo": {"identificacao": "Sintese IA"}, "objetivo": {}, "avaliacao": {}, "plano": {}, '
            '"alertas_clinicos": ["Alerta Mock Gemini"], "sugestoes_conduta": ["Conduta 1"], '
            '"sugestoes_exames": ["ECG de repouso"], "sugestoes_encaminhamentos": ["Retorno em 30 dias"]}'
        )
        mock_chat.send_message.return_value = mock_response

        sample_soap = {
            "paciente": {"id": 1, "nome": "Teste", "cpf": None, "nascimento": None, "idade": 30},
            "subjetivo": {},
            "objetivo": {},
            "avaliacao": {},
            "plano": {},
            "indicadores_previne": [],
        }

        with override_settings(GEMINI_API_KEY="test-api-key"):
            res = generate_ai_assisted_soap(sample_soap, professional_notes="Sem queixas")
            self.assertTrue(res["is_ai_enhanced"])
            self.assertEqual(res["alertas_clinicos"], ["Alerta Mock Gemini"])
            self.assertEqual(res["sugestoes_conduta"], ["Conduta 1"])
            self.assertEqual(res["sugestoes_exames"], ["ECG de repouso"])
            self.assertEqual(res["sugestoes_encaminhamentos"], ["Retorno em 30 dias"])
            self.assertEqual(res["subjetivo"]["identificacao"], "Sintese IA")
            mock_client.chats.create.assert_called_once()
            _, create_kwargs = mock_client.chats.create.call_args
            self.assertTrue(create_kwargs["config"].tools)
            mock_chat.send_message.assert_called_once()

    @patch("google.genai.Client")
    def test_gemini_retries_tools_without_json_mime_type_when_rejected(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client
        mock_chat = MagicMock()
        mock_response = MagicMock()
        mock_response.text = (
            '```json\n{"subjetivo": {"identificacao": "Prosa fluida"}, "objetivo": {}, "avaliacao": {}, "plano": {}, '
            '"alertas_clinicos": ["Alerta"], "sugestoes_conduta": [], "sugestoes_exames": [], "sugestoes_encaminhamentos": []}\n```'
        )
        mock_chat.send_message.return_value = mock_response
        # Primeira chamada (tools + JSON) falha; segunda (tools sem response_mime_type) funciona
        mock_client.chats.create.side_effect = [RuntimeError("JSON mode with tools unsupported"), mock_chat]

        sample_soap = {
            "paciente": {"id": 0, "nome": "Rascunho", "cpf": None, "nascimento": None, "idade": 40},
            "subjetivo": {}, "objetivo": {}, "avaliacao": {}, "plano": {}, "indicadores_previne": [],
        }

        with override_settings(GEMINI_API_KEY="test-api-key"):
            res = generate_ai_assisted_soap(sample_soap)
            self.assertEqual(res["subjetivo"]["identificacao"], "Prosa fluida")
            self.assertEqual(mock_client.chats.create.call_count, 2)
            second_config = mock_client.chats.create.call_args_list[1].kwargs["config"]
            self.assertTrue(second_config.tools)
            self.assertIsNone(second_config.response_mime_type)

    def test_polish_field_prose_covers_objetivo_and_avaliacao(self):
        obj_text = _polish_field_prose("1ª aferição: 150/95 mmHg. Edemas: AUSENTE. Dispneia: PRESENTE.")
        self.assertIn("Primeira aferição de pressão arterial: 150/95 mmHg.", obj_text)
        self.assertIn("Sem edemas ao exame.", obj_text)
        self.assertIn("Refere dispneia.", obj_text)

        av_text = _polish_field_prose("HAS — classificação: Hipertenso Estágio 1. Adesão medicamentosa: IRREGULAR.")
        self.assertIn("Hipertensão arterial sistêmica classificada como Hipertenso Estágio 1.", av_text)
        self.assertIn("Adesão medicamentosa irregular.", av_text)

    def test_fetch_patient_clinical_context_from_db_unsaved(self):
        msg = fetch_patient_clinical_context_from_db(None)
        self.assertIn("sem histórico prévio", msg)



@override_settings(GEMINI_API_KEY="")
class SOAPAiAssistEndpointTest(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username="patient1", password="Password123!"
        )
        self.patient = PatientUser.objects.create(
            user=self.patient_user, cpf="11111111111"
        )
        self.has = HAS.objects.create(
            patient=self.patient,
            BP_assessment1_1=150,
            BP_assessment1_2=95,
            BP_classifications="HIPERTENSO_E1",
            is_diagnosed=True,
        )

        self.other_patient_user = User.objects.create_user(
            username="patient2", password="Password123!"
        )
        self.other_patient = PatientUser.objects.create(
            user=self.other_patient_user, cpf="22222222222"
        )

        self.prof_user = User.objects.create_user(
            username="prof1", password="Password123!"
        )
        self.prof = ProfessionalUser.objects.create(
            user=self.prof_user, role="Médico"
        )

    def test_professional_can_request_ai_assistance_with_patient_id(self):
        self.client.force_authenticate(user=self.prof_user)
        response = self.client.post(
            "/api/v1/reports/soap/assist/",
            {
                "patient_id": self.patient.id,
                "professional_notes": "Paciente relata estresse no trabalho.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_ai_enhanced"])
        self.assertIn("subjetivo", response.data)
        self.assertIn("alertas_clinicos", response.data)

    def test_professional_can_request_ai_assistance_with_base_soap_draft(self):
        self.client.force_authenticate(user=self.prof_user)
        base_soap = {
            "paciente": {
                "id": 0,
                "nome": "Paciente Rascunho",
                "cpf": None,
                "nascimento": None,
                "idade": 45,
            },
            "subjetivo": {
                "identificacao": "Paciente Masculino, 45 anos.",
                "historico": "Histórico familiar negativo.",
                "determinantes": "",
                "estilo_vida": "Tabagismo: NUNCA FUMOU.",
            },
            "objetivo": {
                "pressao_arterial": "120/80 mmHg",
            },
            "avaliacao": {
                "hipertensao": "Normotenso",
            },
            "plano": {
                "conduta_clinica": "Manter hábitos saudáveis.",
            },
            "indicadores_previne": [],
            "gerado_em": "06/11/2026",
        }
        response = self.client.post(
            "/api/v1/reports/soap/assist/",
            {
                "base_soap": base_soap,
                "professional_notes": "Acompanhamento anual de rotina.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_ai_enhanced"])

    def test_patient_cannot_request_ai_assistance_for_other_patient(self):
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.post(
            "/api/v1/reports/soap/assist/",
            {"patient_id": self.other_patient.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fetch_patient_clinical_context_from_db_returns_deidentified_data(self):
        ctx = fetch_patient_clinical_context_from_db(self.patient.id)
        self.assertIn("HAS: diagnosticada=Sim", ctx)
        self.assertNotIn("11111111111", ctx)
        self.assertNotIn("patient1", ctx)

