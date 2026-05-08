from decimal import Decimal

import pytest

from app.services.liquidacion import salario_proporcional, _distribuir_horas


def test_salario_proporcional():
    valor = salario_proporcional(
        salario_mensual=Decimal("2000000.00"),
        dias_quincena=12,
        dias_mes=24,
    )
    assert valor == Decimal("1000000.00")


def test_salario_proporcional_dias_mes_invalido():
    with pytest.raises(ValueError):
        salario_proporcional(Decimal("2000000.00"), 12, 0)


def test_distribuir_horas_umbral():
    data = _distribuir_horas(
        horas_diurnas=Decimal("70.00"),
        horas_nocturnas=Decimal("20.00"),
        umbral=Decimal("80.00"),
    )
    assert data["total_horas"] == Decimal("90.00")
    assert data["ordinaria_diurna"] == Decimal("60.00")
    assert data["ordinaria_nocturna"] == Decimal("20.00")
    assert data["extra_diurna"] == Decimal("10.00")
    assert data["extra_nocturna"] == Decimal("0.00")
