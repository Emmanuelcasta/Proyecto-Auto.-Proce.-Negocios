from decimal import Decimal

import pytest

from app.services.recargos import clasificar_horas, calcular_valor


@pytest.mark.parametrize(
    "es_nocturno,es_festivo_o_dominical,es_extra,esperado",
    [
        (False, False, False, "ordinaria_diurna"),
        (True, False, False, "ordinaria_nocturna"),
        (False, False, True, "extra_diurna"),
        (True, False, True, "extra_nocturna"),
        (False, True, False, "festivo_diurno"),
        (False, True, True, "extra_festivo_diurno"),
        (True, True, True, "extra_festivo_nocturno"),
    ],
)
def test_clasificar_horas(es_nocturno, es_festivo_o_dominical, es_extra, esperado):
    assert clasificar_horas(es_nocturno, es_festivo_o_dominical, es_extra) == esperado


def test_calcular_valor_ordinaria_nocturna():
    # 3 horas * 10.000 * 1.35 = 40.500
    valor = calcular_valor(
        horas=Decimal("3"),
        tipo="ordinaria_nocturna",
        valor_hora=Decimal("10000"),
    )
    assert valor == Decimal("40500.00")


def test_calcular_valor_extra_festivo_nocturno():
    # 2 horas * 10.000 * 2.55 = 51.000
    valor = calcular_valor(
        horas=Decimal("2"),
        tipo="extra_festivo_nocturno",
        valor_hora=Decimal("10000"),
    )
    assert valor == Decimal("51000.00")


def test_calcular_valor_tipo_invalido():
    with pytest.raises(ValueError):
        calcular_valor(
            horas=Decimal("1"),
            tipo="tipo_invalido",
            valor_hora=Decimal("10000"),
        )
