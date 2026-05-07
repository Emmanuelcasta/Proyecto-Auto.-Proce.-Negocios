-- =============================================================
-- SysClock Nómina — Schema inicial
-- Ejecutar en: Supabase SQL Editor
-- =============================================================

-- 1. Tipo enum para roles de usuario
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'CONTADOR', 'EMPLEADO');

-- 2. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           rol_usuario  NOT NULL DEFAULT 'EMPLEADO',
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_usuarios_email ON usuarios (email);

-- 3. Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id         SERIAL PRIMARY KEY,
    nombre     VARCHAR(255)     NOT NULL,
    documento  VARCHAR(50)      NOT NULL UNIQUE,
    salario    NUMERIC(12, 2)   NOT NULL DEFAULT 0.00,
    activo     BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_empleados_documento ON empleados (documento);

-- 4. Tabla de configuracion (singleton)
CREATE TABLE IF NOT EXISTS configuracion (
    id                  SERIAL PRIMARY KEY,
    smmlv               NUMERIC(12, 2) NOT NULL DEFAULT 1423500.00,
    auxilio_transporte  NUMERIC(12, 2) NOT NULL DEFAULT 200000.00,
    festivos            TEXT           NOT NULL DEFAULT '[]',
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- 5. Tabla de control de versiones de Alembic
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

INSERT INTO alembic_version (version_num) VALUES ('initial_001')
ON CONFLICT DO NOTHING;
