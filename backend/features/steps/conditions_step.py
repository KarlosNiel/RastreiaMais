from behave import given, when, then
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser
from apps.conditions.models import DCNT, HAS, DM, OtherDCNT
from django.core.exceptions import ValidationError

@given('existe um usuário "{username}" com email "{email}"')
def step_impl_create_user(context, username, email):
    user = User.objects.create_user(username=username, email=email, password="123456")
    patient = PatientUser.objects.create(user=user)
    context.patient = patient

# --------------------- DCNT ---------------------
@when('eu criar um DCNT para esse paciente diagnosticado')
def step_impl_create_dcnt(context):
    context.dcnt = DCNT.objects.create(patient=context.patient, is_diagnosed=True)

@when('eu criar um DCNT sem paciente')
def step_impl_create_dcnt_no_patient(context):
    context.dcnt = DCNT.objects.create(is_diagnosed=False)

@then('o DCNT deve ser criado com paciente associado e diagnosticado')
def step_impl_check_dcnt(context):
    assert context.dcnt.patient == context.patient
    assert context.dcnt.is_diagnosed is True

@then('o DCNT deve ser criado sem paciente e não diagnosticado')
def step_impl_check_dcnt_no_patient(context):
    assert context.dcnt.patient is None
    assert context.dcnt.is_diagnosed is False

# --------------------- HAS ---------------------
@when('eu criar um HAS para esse paciente com complicação "{complication}"')
def step_impl_create_has(context, complication):
    context.has = HAS.objects.create(patient=context.patient, any_complications_HBP=complication)

@then('o HAS deve ter a complicação "{complication}" associada')
def step_impl_check_has(context, complication):
    assert context.has.any_complications_HBP == complication

# --------------------- DM ---------------------
@when('eu criar um DM para esse paciente com tratamento "{treatment}" e comorbidade "{comorbidity}"')
def step_impl_create_dm(context, treatment, comorbidity):
    context.dm = DM.objects.create(
        patient=context.patient,
        treatment_type=treatment,
        diabetes_comorbidities=comorbidity,
        diabetic_foot=True
    )

@then('o DM deve ter tratamento "{treatment}" e comorbidade "{comorbidity}"')
def step_impl_check_dm(context, treatment, comorbidity):
    assert context.dm.treatment_type == treatment
    assert context.dm.diabetes_comorbidities == comorbidity
    assert context.dm.diabetic_foot is True

# --------------------- OtherDCNT ---------------------
@when('eu criar um OtherDCNT para esse paciente com nome "{name}"')
def step_impl_create_other(context, name):
    context.other = OtherDCNT.objects.create(patient=context.patient, name=name)

@then('o OtherDCNT deve ter o nome "{name}"')
def step_impl_check_other(context, name):
    assert context.other.name == name
