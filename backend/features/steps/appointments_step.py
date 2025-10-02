from behave import given, when, then
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser, ProfessionalUser
from apps.locations.models import Institution
from apps.appointments.models import Appointment
from django.utils.timezone import now, timedelta
from django.db.utils import IntegrityError

@given('existe um paciente chamado "{nome}" em appoitments')
def step_existe_paciente(context, nome):
    user = User.objects.create_user(
        username=nome.lower().replace(" ", "_"),
        password="123456",
        first_name=nome.split()[0],
        last_name=nome.split()[1] if len(nome.split()) > 1 else ""
    )
    context.paciente = PatientUser.objects.create(user=user)

@given('existe um profissional chamado "{nome}" com função "{role}" em appoitments')
def step_existe_profissional(context, nome, role):
    user = User.objects.create_user(
        username=nome.lower().replace(" ", "_"),
        password="123456",
        first_name=nome.split()[0],
        last_name=nome.split()[1] if len(nome.split()) > 1 else ""
    )
    context.profissional = ProfessionalUser.objects.create(user=user, role=role)

@given('existe uma instituição chamada "{nome}"')
def step_existe_instituicao(context, nome):
    context.instituicao = Institution.objects.create(name=nome)

@when('crio uma consulta para o paciente "{paciente}" com o profissional "{profissional}" na instituição "{instituicao}"')
def step_criar_consulta_com_instituicao(context, paciente, profissional, instituicao):
    context.consulta = Appointment.objects.create(
        patient=context.paciente,
        professional=context.profissional,
        scheduled_datetime=now() + timedelta(days=1),
        local=context.instituicao,
        risk_level="Moderado",
        type="Consulta",
        description="Consulta de rotina",
        status="Agendado"
    )

@when('crio uma consulta para o paciente "{paciente}" com o profissional "{profissional}" sem instituição')
def step_criar_consulta_sem_instituicao(context, paciente, profissional):
    context.consulta = Appointment.objects.create(
        patient=context.paciente,
        professional=context.profissional,
        scheduled_datetime=now() + timedelta(days=1),
        risk_level="Seguro",
        type="Exame"
    )

@when('tento criar uma consulta sem paciente ou profissional')
def step_tentar_criar_sem_paciente_profissional(context):
    try:
        Appointment.objects.create(
            patient=None,
            professional=None,
            scheduled_datetime=now() + timedelta(days=1),
            risk_level="Seguro",
            type="Consulta"
        )
        context.exception = None
    except IntegrityError as e:
        context.exception = e

@then('a consulta deve estar associada ao paciente "{nome}"')
def step_verificar_paciente(context, nome):
    assert context.consulta.patient.user.get_full_name() == nome

@then('a consulta deve estar associada ao profissional "{nome}"')
def step_verificar_profissional(context, nome):
    assert context.consulta.professional.user.get_full_name() == nome

@then('a consulta deve estar na instituição "{nome}"')
def step_verificar_instituicao(context, nome):
    assert context.consulta.local.name == nome

@then('a consulta não deve ter instituição')
def step_verificar_sem_instituicao(context):
    assert context.consulta.local is None

@then('a consulta deve ter risco "{risco}"')
def step_verificar_risco(context, risco):
    assert context.consulta.risk_level == risco

@then('a consulta deve ser do tipo "{tipo}"')
def step_verificar_tipo(context, tipo):
    assert context.consulta.type == tipo

@then('a consulta deve ter status "{status}"')
def step_verificar_status(context, status):
    assert context.consulta.status == status

@then('a descrição da consulta deve ser "{descricao}"')
def step_verificar_descricao(context, descricao):
    assert context.consulta.description == descricao

@then('deve ser levantado um IntegrityError de appointment')
def step_verificar_integrity_error(context):
    assert context.exception is not None
    assert isinstance(context.exception, IntegrityError)
