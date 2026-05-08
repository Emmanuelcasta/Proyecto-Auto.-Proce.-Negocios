from decimal import Decimal

import pytest

from app.services.aportes_empleador import calcular_aportes_empleador


def test_calcular_aportes_empleador_clase_1():
    aportes = calcular_aportes_empleador(Decimal("1200000.00"), clase_riesgo_arl=1)
    assert aportes["salud_empleador"] == Decimal("102000.00")
    assert aportes["pension_empleador"] == Decimal("144000.00")
    assert aportes["arl"] == Decimal("6240.00")
    assert aportes["caja_compensacion"] == Decimal("48000.00")
    assert aportes["sena"] == Decimal("24000.00")
    assert aportes["icbf"] == Decimal("36000.00")


def test_calcular_aportes_empleador_clase_invalida():
    with pytest.raises(ValueError):
        calcular_aportes_empleador(Decimal("1200000.00"), clase_riesgo_arl=9)
