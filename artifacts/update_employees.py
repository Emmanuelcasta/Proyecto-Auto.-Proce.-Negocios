import asyncio
import sys
import os
from decimal import Decimal
from datetime import date

# Add backend directory to sys.path so we can import from app
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import AsyncSessionLocal, engine
from app.models.empleado import Empleado
from app.models.turno import CicloRotacion
from app.config import get_settings
from sqlalchemy import delete, select

async def update_database():
    settings = get_settings()
    print(f"DEBUG: DATABASE_URL cargado = {settings.DATABASE_URL}")
    print("--- Conectando a la base de datos...")
    async with AsyncSessionLocal() as session:
        try:
            # 1. Eliminar todos los ciclos de rotación existentes (para evitar conflictos de FK)
            print("--- Eliminando ciclos de rotación...")
            await session.execute(delete(CicloRotacion))
            
            # 2. Eliminar los empleados anteriores
            print("--- Eliminando empleados anteriores...")
            await session.execute(delete(Empleado))
            
            # 3. Crear los nuevos empleados
            print("--- Creando nuevos empleados con salario mínimo ($1.423.500)...")
            nuevos_empleados = [
                Empleado(nombre="Julian Andres Molina", documento="1001234567", salario=Decimal("1423500.00"), activo=True),
                Empleado(nombre="Jhon Mauricio Echeverry", documento="1002345678", salario=Decimal("1423500.00"), activo=True),
                Empleado(nombre="Juan Esteban Villa", documento="1003456789", salario=Decimal("1423500.00"), activo=True),
            ]
            for emp in nuevos_empleados:
                session.add(emp)
            
            # Flush para obtener los IDs
            await session.flush()
            
            emp_ids = [emp.id for emp in nuevos_empleados]
            print(f"Nuevos empleados creados con IDs: {emp_ids}")
            
            # 4. Crear el nuevo ciclo de rotación activo
            print("--- Creando el nuevo ciclo de rotación activo...")
            nuevo_ciclo = CicloRotacion(
                fecha_inicio_ciclo=date(2026, 5, 18), # Lunes
                empleado_a_id=emp_ids[0],
                empleado_b_id=emp_ids[1],
                empleado_c_id=emp_ids[2],
                activo=True,
                creado_por=1 # Admin por defecto
            )
            session.add(nuevo_ciclo)
            
            # Confirmar la transacción
            await session.commit()
            print("¡Cambios aplicados con éxito en la base de datos!")
            
        except Exception as e:
            await session.rollback()
            print(f"Error al actualizar la base de datos: {e}")
            raise e

if __name__ == "__main__":
    # Run the async update
    asyncio.run(update_database())
