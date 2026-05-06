#!/bin/bash
set -e

echo "🔄 Ejecutando migraciones de base de datos..."
alembic upgrade head

echo "🚀 Iniciando servidor SysClock Nómina..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
