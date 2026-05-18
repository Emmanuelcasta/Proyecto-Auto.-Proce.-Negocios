import asyncio
import sys
import os
from sqlalchemy import text

# Add backend directory to sys.path so we can import from app
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import AsyncSessionLocal

async def force_ids():
    print("--- Conectando a la base de datos...")
    async with AsyncSessionLocal() as session:
        try:
            # 1. Eliminar datos existentes
            print("--- Limpiando tablas para evitar conflictos de llave primaria o foránea...")
            await session.execute(text("TRUNCATE TABLE ciclo_rotacion CASCADE;"))
            await session.execute(text("TRUNCATE TABLE empleados CASCADE;"))
            
            # 2. Insertar empleados con IDs explícitos 1, 2, 3
            print("--- Insertando nuevos empleados con IDs explícitos (1, 2, 3) y salario mínimo ($1.423.500)...")
            insert_empleados_sql = text("""
                INSERT INTO empleados (id, nombre, documento, salario, activo, created_at, updated_at)
                VALUES 
                (1, 'Julian Andres Molina', '1001234567', 1423500.00, true, NOW(), NOW()),
                (2, 'Jhon Mauricio Echeverry', '1002345678', 1423500.00, true, NOW(), NOW()),
                (3, 'Juan Esteban Villa', '1003456789', 1423500.00, true, NOW(), NOW());
            """)
            await session.execute(insert_empleados_sql)
            
            # 3. Insertar ciclo de rotación con los nuevos IDs
            print("--- Creando el ciclo de rotación activo...")
            insert_ciclo_sql = text("""
                INSERT INTO ciclo_rotacion (id, fecha_inicio_ciclo, empleado_a_id, empleado_b_id, empleado_c_id, activo, creado_por, creado_en)
                VALUES (1, '2026-05-18', 1, 2, 3, true, 1, NOW());
            """)
            await session.execute(insert_ciclo_sql)
            
            # 4. Sincronizar las secuencias (sequences) de autoincremento para evitar errores en futuras inserciones
            print("--- Sincronizando secuencias de autoincremento (setval)...")
            await session.execute(text("SELECT setval('empleados_id_seq', 3);"))
            await session.execute(text("SELECT setval('ciclo_rotacion_id_seq', 1);"))
            
            await session.commit()
            print("¡Cambios de IDs aplicados con éxito absoluto en la base de datos!")
            
        except Exception as e:
            await session.rollback()
            print(f"Error al aplicar cambios: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(force_ids())
