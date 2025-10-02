from behave import given, when, then
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser
from apps.medications.models import Medication
from django.db.utils import IntegrityError
from django.utils.timezone import now, timedelta

@given('que exista um paciente')
def step_criar_paciente(context):
    user = User.objects.create_user(
        username="testuser",
        password="password123",
        first_name="Test",
        last_name="User"
    )
    context.paciente = PatientUser.objects.create(user=user)

@when('tento criar uma medicação sem end_date')
def step_criar_med_sem_end_date(context):
    try:
        Medication.objects.create(
            patient=context.paciente,
            name="Med Sem End Date",
            description="Sem data de término",
            end_date=None,
            active=True
        )
        context.erro = None
    except IntegrityError as e:
        context.erro = e

@when('crio uma medicação com end_date em {dias:d} dias')
def step_criar_med_end_date_futuro(context, dias):
    end_date = now().date() + timedelta(days=dias)
    context.med = Medication.objects.create(
        patient=context.paciente,
        name=f"Med daqui {dias} dias",
        description="Medicação de teste",
        end_date=end_date,
        active=True
    )

@when('crio uma medicação com end_date há {dias:d} dias')
def step_criar_med_end_date_passado(context, dias):
    end_date = now().date() - timedelta(days=dias)
    context.med = Medication.objects.create(
        patient=context.paciente,
        name=f"Med de {dias} dias atrás",
        description="Medicação de teste",
        end_date=end_date,
        active=True
    )

@when('finalizo a medicação')
def step_finalizar_med(context):
    context.med.finished()
    context.med.refresh_from_db()

@then('deve ser levantado um IntegrityError')
def step_asser_erro(context):
    assert context.erro is not None, "Esperava IntegrityError, mas não ocorreu"

@then('a medicação deve estar ativa')
def step_med_ativa(context):
    assert context.med.is_active() is True

@then('a medicação não deve estar ativa')
def step_med_inativa(context):
    assert context.med.is_active() is False

@then('a medicação deve estar deletada')
def step_med_deletada(context):
    assert context.med.is_deleted is True

@then('a medicação não deve estar deletada')
def step_med_nao_deletada(context):
    assert context.med.is_deleted is False
