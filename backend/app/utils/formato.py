"""
Utilidades de formateo para el sistema SysClock Nómina.
"""

from decimal import Decimal


def formato_cop(valor: Decimal | float | int) -> str:
    """
    Formatea un valor numérico como moneda colombiana (COP).
    Ejemplo: 1423500 -> "$ 1.423.500"
    """
    if valor is None:
        return "$ 0"
    
    # Redondear a entero para moneda colombiana (normalmente no se usan centavos en nómina)
    valor_int = round(float(valor))
    
    # Formatear con separadores de miles
    # Python format con coma como separador de miles y luego reemplazar por puntos
    formateado = "{:,.0f}".format(valor_int).replace(",", ".")
    
    return f"$ {formateado}"


def formato_porcentaje(valor: Decimal | float) -> str:
    """
    Formatea un valor decimal como porcentaje.
    Ejemplo: 0.04 -> "4.00%"
    """
    if valor is None:
        return "0.00%"
    
    return "{:.2%}".format(float(valor))


def formato_horas(valor: Decimal | float) -> str:
    """
    Formatea un valor decimal de horas.
    Ejemplo: 7.3333 -> "7.33h"
    """
    if valor is None:
        return "0.00h"
    
    return "{:.2f}h".format(float(valor))
