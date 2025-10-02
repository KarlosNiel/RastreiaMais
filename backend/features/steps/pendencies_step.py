from behave import given, when, then
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser
from apps.locations.models import MicroArea, Address
from apps.pendencies.models import Pendency
from django.db.utils import IntegrityError

@given('existe um paciente chamado "{nome}"')
def step_existe_paciente(context, nome):
    user = User.objects.create_user(username=nome.lower().replace(" ", "_"), password="123456", first_name=nome.split()[0], last_name=nome.split()[1])
    context.paciente = PatientUser.objects.create(user=user)

@given('existe uma microárea chamada "{nome}"')
def step_existe_microarea(context, nome):
    # Criar endereço fictício para MicroArea
    address = Address.objects.create(
        uf="PB",
        city="Patos",
        district="Centro",
        street="Rua Teste",
        number=123,
        complement="Bloco A",
        zipcode="58000-000"
    )
    context.micro_area = MicroArea.objects.create(
        name=nome,
        maps_localization="https://maps.example.com/1",
        address=address
    )

@when('crio uma pendência para o paciente "{nome}" com a microárea "{microarea}"')
def step_criar_pendency_com_microarea(context, nome, microarea):
    context.pendency = Pendency.objects.create(
        patient=context.paciente,
        micro_area=context.micro_area
    )

@when('crio uma pendência para o paciente "{nome}" sem microárea')
def step_criar_pendency_sem_microarea(context, nome):
    context.pendency = Pendency.objects.create(
        patient=context.paciente,
        micro_area=None
    )

@when('tento criar uma pendência sem paciente')
def step_tentar_criar_sem_paciente(context):
    try:
        pendency = Pendency.objects.create(
            patient=None,
            micro_area=None
        )
        pendency.full_clean()  # valida campos obrigatórios
        pendency.save()
        context.exception = None
    except IntegrityError as e:
        context.exception = e

@then('a pendência deve estar associada ao paciente "{nome}"')
def step_verificar_paciente(context, nome):
    assert context.pendency.patient.user.get_full_name() == nome

@then('a pendência deve estar associada à microárea "{nome}"')
def step_verificar_microarea(context, nome):
    assert context.pendency.micro_area.name == nome

@then('a pendência não deve ter microárea')
def step_verificar_sem_microarea(context):
    assert context.pendency.micro_area is None

@then('deve ser levantado um IntegrityError de pendencies')
def step_verificar_integrity_error(context):
    assert context.exception is not None
    assert isinstance(context.exception, IntegrityError)
