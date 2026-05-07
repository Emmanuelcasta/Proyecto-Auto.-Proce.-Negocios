# SysClock Nómina

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/Licencia-MIT-green)](LICENSE)

Sistema de automatización de nómina para Colombia (CST 2026). Gestiona marcaciones vía Google Forms, liquida quincenas y calcula recargos nocturnos, horas extra y aportes a seguridad social.

---

## Tabla de contenido

- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [API](#api)
- [Frontend](#frontend)
- [Despliegue](#despliegue)

---

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Google Forms   │────▶│   Make (webhook) │────▶│  FastAPI API    │
│  (marcaciones)  │     │  Google Sheets   │     │  :8000          │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
┌─────────────────┐                               │   PostgreSQL    │
│  React Frontend │◀──────────────────────────────│   (Supabase)    │
│  :5173 / Vercel │    JWT Auth (Bearer)           └─────────────────┘
└─────────────────┘
```

**Stack:**

| Capa | Tecnología |
|---|---|
| Backend | FastAPI 0.115, Python 3.13, Uvicorn |
| ORM | SQLAlchemy 2.0 async + asyncpg |
| Migraciones | Alembic |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Base de datos | PostgreSQL 15 en Supabase |
| Frontend | React 18 + Vite 6 |
| Despliegue backend | Railway |
| Despliegue frontend | Vercel |

---

## Requisitos

- Python 3.11 o superior
- Node.js 18 o superior
- Cuenta en [Supabase](https://supabase.com) (base de datos)

---

## Instalación local

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows
# source .venv/bin/activate     # macOS/Linux

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
uvicorn app.main:app --reload
```

El servidor queda disponible en `http://localhost:8000`.
Documentación interactiva: `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend

npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

---

## Variables de entorno

Crea `backend/.env` copiando `backend/.env.example`:

```env
# Base de datos (Session Pooler de Supabase)
DATABASE_URL=postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# JWT — genera con: openssl rand -hex 32
JWT_SECRET_KEY=tu-secreto-seguro-aqui
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=8
REFRESH_TOKEN_EXPIRE_DAYS=7

# Make.com (webhooks de marcaciones)
MAKE_API_KEY=tu-api-key-de-make

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

ENVIRONMENT=development
```

> **Nota sobre la contraseña:** si la contraseña contiene `#`, codifícala como `%23` en la URL.

---

## Base de datos

Las tablas se crean ejecutando `backend/supabase_init.sql` en el SQL Editor de Supabase:

```sql
-- Ejecutar en: Supabase → SQL Editor → New query
-- Archivo: backend/supabase_init.sql
```

Tablas creadas:

| Tabla | Descripción |
|---|---|
| `usuarios` | Cuentas del sistema con roles (ADMIN, CONTADOR, EMPLEADO) |
| `empleados` | Registro de empleados con salario y documento |
| `configuracion` | SMMLV, auxilio de transporte, festivos (singleton) |
| `alembic_version` | Control de versiones de migraciones |

**Usuario admin por defecto** (se crea automáticamente al iniciar el backend):
- Email: `admin@sysclock.com`
- Password: `Admin123!`

---

## API

Base URL: `http://localhost:8000/api/v1`

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión → devuelve `access_token` + `refresh_token` |
| `POST` | `/auth/refresh` | Renovar access token |
| `POST` | `/auth/logout` | Cerrar sesión |

### Empleados

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/empleados` | Listar con paginación | ADMIN, CONTADOR |
| `POST` | `/empleados` | Crear empleado | ADMIN |
| `PUT` | `/empleados/{id}` | Actualizar empleado | ADMIN |
| `DELETE` | `/empleados/{id}` | Desactivar empleado | ADMIN |

### Configuración

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/configuracion` | Obtener parámetros de nómina | ADMIN, CONTADOR |
| `PUT` | `/configuracion` | Actualizar SMMLV, festivos | ADMIN |

### Salud

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check para UptimeRobot / Railway |

Documentación completa en `/docs` (Swagger UI) o `/redoc`.

---

## Frontend

```
frontend/
├── src/
│   ├── components/       # Primitivos de UI (Button, Card, Modal, Sidebar…)
│   ├── screens/          # Pantallas de la aplicación
│   │   ├── LoginScreen.jsx
│   │   ├── DashboardScreen.jsx
│   │   ├── EmpleadosScreen.jsx
│   │   ├── TurnosScreen.jsx
│   │   ├── MarcacionesScreen.jsx
│   │   ├── NominaListScreen.jsx
│   │   ├── LiquidacionScreen.jsx
│   │   └── ReportesScreen.jsx
│   ├── lib/
│   │   ├── api.js         # Cliente HTTP con refresh automático de JWT
│   │   ├── formatters.js  # formatCOP(), formatHrs() en locale es-CO
│   │   └── fakeData.js    # Datos stub para pantallas sin endpoint aún
│   └── styles/
│       └── globals.css    # Tokens de diseño (colores, tipografía, espaciado)
└── public/
    ├── logo.svg
    └── mark.svg
```

**Paleta de colores:** `#1A3A5C` azul corporativo · Inter · shadcn/ui visual dialect.

**Pantallas implementadas:**

| Pantalla | Datos reales | Notas |
|---|---|---|
| Login | ✅ Backend JWT | |
| Dashboard | ✅ Conteo empleados | Gráficas con datos stub |
| Empleados | ✅ CRUD completo | |
| Turnos | Stub | Ciclo de rotación fijo |
| Marcaciones | Stub | Pendiente endpoint Make → backend |
| Nómina | Stub | Pendiente motor de liquidación |
| Liquidación | Stub | Detalle quincena |
| Reportes | Stub | Generación pendiente |

---

## Despliegue

### Backend — Railway

El repositorio incluye `backend/railway.toml`. Railway detecta el `Dockerfile` y despliega automáticamente al hacer push a `main`.

Variables de entorno requeridas en Railway:
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `MAKE_API_KEY`
- `CORS_ORIGINS` (dominio de Vercel)
- `ENVIRONMENT=production`

### Frontend — Vercel

```bash
cd frontend
npm run build
# Desplegar en Vercel apuntando a la carpeta frontend/
```

---

## Estructura del repositorio

```
.
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── alembic/
│   ├── supabase_init.sql  # Script de inicialización de BD
│   ├── Dockerfile
│   ├── railway.toml
│   └── requirements.txt
└── frontend/              # React + Vite app
    ├── src/
    ├── public/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Licencia

MIT © 2026 — SysClock Nómina
