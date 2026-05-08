import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from app.services.marcaciones import _calcular_horas_efectivas, _extraer_fecha_bogota

def test_calcular_horas_efectivas_normal():
    # 8 horas brutas - 20 min (0.3333h) = 7.6667 -> redondear a 7.67
    entrada = datetime(2026, 5, 4, 6, 0)
    salida = datetime(2026, 5, 4, 14, 0)
    horas = _calcular_horas_efectivas(entrada, salida)
    # 8 - 1/3 = 7.6666... -> quantize 7.67
    assert horas == Decimal("7.67")

def test_calcular_horas_efectivas_corta():
    # 1 hora bruta - 20 min = 40 min (0.6667h) -> 0.67
    entrada = datetime(2026, 5, 4, 8, 0)
    salida = datetime(2026, 5, 4, 9, 0)
    horas = _calcular_horas_efectivas(entrada, salida)
    assert horas == Decimal("0.67")

def test_calcular_horas_efectivas_minima():
    # Menos de 20 min -> 0
    entrada = datetime(2026, 5, 4, 8, 0)
    salida = datetime(2026, 5, 4, 8, 15)
    horas = _calcular_horas_efectivas(entrada, salida)
    assert horas == Decimal("0.00")

def test_extraer_fecha_bogota():
    # UTC-5: 2026-05-04 02:00:00 UTC es 2026-05-03 21:00:00 en Bogotá
    ts_utc = datetime(2026, 5, 4, 2, 0, tzinfo=datetime.now().astimezone().tzinfo)
    # Depende de la zona horaria del sistema donde corre el test, pero la función usa ZoneInfo("America/Bogota")
    # Así que forzamos un timestamp consciente de la zona horaria
    from zoneinfo import ZoneInfo
    ts = datetime(2026, 5, 4, 2, 0, tzinfo=ZoneInfo("UTC"))
    fecha = _extraer_fecha_bogota(ts)
    assert str(fecha) == "2026-05-03"
