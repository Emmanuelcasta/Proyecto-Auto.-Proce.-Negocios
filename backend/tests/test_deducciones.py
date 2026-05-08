from decimal import Decimal

from app.services.deducciones import calcular_deducciones, calcular_auxilio


def test_calcular_deducciones_solo_sobre_basico():
    ded = calcular_deducciones(Decimal("1200000.00"))
    assert ded["salud_empleado"] == Decimal("48000.00")
    assert ded["pension_empleado"] == Decimal("48000.00")


def test_calcular_auxilio_aplica_si_salario_hasta_2_smmlv():
    aux = calcular_auxilio(
        salario_mensual=Decimal("2800000"),
        dias_quincena=12,
        dias_mes=24,
        smmlv=Decimal("1423500"),
        auxilio_base=Decimal("200000"),
    )
    assert aux == Decimal("100000.00")


def test_calcular_auxilio_no_aplica_si_supera_2_smmlv():
    aux = calcular_auxilio(
        salario_mensual=Decimal("3000000"),
        dias_quincena=12,
        dias_mes=24,
        smmlv=Decimal("1423500"),
        auxilio_base=Decimal("200000"),
    )
    assert aux == Decimal("0.00")
