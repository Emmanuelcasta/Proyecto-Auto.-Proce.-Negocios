from datetime import datetime, timezone, date
from decimal import Decimal
from types import SimpleNamespace

from app.services.documento import generar_comprobante_docx


def test_generar_comprobante_docx_retorna_bytes_docx():
    nomina = SimpleNamespace(
        id=10,
        empleado_id=1,
        empleado=SimpleNamespace(nombre="Juan Perez"),
        fecha_inicio=date(2026, 5, 1),
        fecha_fin=date(2026, 5, 15),
        estado="APROBADO",
        creado_en=datetime.now(timezone.utc),
        aprobado_en=datetime.now(timezone.utc),
        dias_habiles_quincena=12,
        dias_habiles_mes=24,
        umbral_horas=Decimal("88.00"),
        total_horas_trabajadas=Decimal("92.00"),
        total_devengado=Decimal("1800000.00"),
        total_deducciones=Decimal("96000.00"),
        neto_pagar=Decimal("1704000.00"),
        detalles=[
            SimpleNamespace(
                concepto="Salario básico proporcional",
                categoria="DEVENGADO",
                horas=None,
                porcentaje=None,
                valor=Decimal("1000000.00"),
            ),
            SimpleNamespace(
                concepto="Salud empleado",
                categoria="DEDUCCION",
                horas=None,
                porcentaje=Decimal("0.04"),
                valor=Decimal("48000.00"),
            ),
        ],
    )

    contenido = generar_comprobante_docx(nomina)

    assert isinstance(contenido, bytes)
    # DOCX es un zip, su firma comienza con PK.
    assert contenido.startswith(b"PK")
