from datetime import date, datetime
from decimal import Decimal
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from app.services.horas import (
    valor_hora_ordinaria,
    calcular_umbral_quincena,
    separar_ordinarias_y_extras,
    calcular_horas_nocturnas,
)


BOGOTA = ZoneInfo("America/Bogota")


def test_valor_hora_ordinaria():
    salario = Decimal("2200000")
    assert valor_hora_ordinaria(salario) == Decimal("10000.0000")


def test_calcular_umbral_quincena():
    assert calcular_umbral_quincena(12) == Decimal("88.00")


def test_separar_ordinarias_y_extras():
    ordinarias, extras = separar_ordinarias_y_extras(Decimal("95.50"), Decimal("88.00"))
    assert ordinarias == Decimal("88.00")
    assert extras == Decimal("7.50")


def test_calcular_horas_nocturnas_turno_2_lunes_a_viernes():
    marcacion = SimpleNamespace(
        fecha=date(2026, 5, 4),  # lunes
        timestamp_entrada=datetime(2026, 5, 4, 14, 0, tzinfo=BOGOTA),
        timestamp_salida=datetime(2026, 5, 4, 22, 0, tzinfo=BOGOTA),
    )
    assert calcular_horas_nocturnas(marcacion, "TURNO_2") == Decimal("3.00")


def test_calcular_horas_nocturnas_no_aplica_sabado():
    marcacion = SimpleNamespace(
        fecha=date(2026, 5, 9),  # sábado
        timestamp_entrada=datetime(2026, 5, 9, 12, 0, tzinfo=BOGOTA),
        timestamp_salida=datetime(2026, 5, 9, 18, 0, tzinfo=BOGOTA),
    )
    assert calcular_horas_nocturnas(marcacion, "TURNO_2") == Decimal("0.00")


def test_calcular_horas_nocturnas_no_aplica_turno_1():
    marcacion = SimpleNamespace(
        fecha=date(2026, 5, 5),
        timestamp_entrada=datetime(2026, 5, 5, 6, 0, tzinfo=BOGOTA),
        timestamp_salida=datetime(2026, 5, 5, 14, 0, tzinfo=BOGOTA),
    )
    assert calcular_horas_nocturnas(marcacion, "TURNO_1") == Decimal("0.00")
