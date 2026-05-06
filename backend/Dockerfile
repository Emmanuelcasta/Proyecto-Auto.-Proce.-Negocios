FROM python:3.11-slim

# Evitar archivos .pyc y habilitar output sin buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Hacer ejecutable el script de inicio
COPY start.sh .
RUN chmod +x start.sh

# Puerto por defecto (Railway lo sobreescribe)
EXPOSE 8000

# Ejecutar migraciones y luego el servidor
CMD ["./start.sh"]
