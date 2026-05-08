# SysClock Nómina

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/Licencia-MIT-green)](LICENSE)

Sistema de automatización de nómina para Colombia (CST 2026). Gestiona marcaciones vía Google Forms, liquida quincenas automáticamente y genera reportes PILA en Excel.

---

## Características principales

- **Liquidación automática**: Cálculo preciso de recargos nocturnos, extras diurnas/nocturnas y festivos según la normativa colombiana.
- **Integración con Make**: Recibe marcaciones en tiempo real desde Google Forms/Sheets.
- **Reportes PILA**: Generación de archivos Excel listos para la planilla de seguridad social.
- **Autoservicio para empleados**: Los trabajadores pueden consultar su historial y descargar comprobantes de pago.
- **Seguridad**: Autenticación JWT y control de acceso basado en roles (RBAC).

---

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Google Forms   │────▶│   Make (webhook) │────▶│  FastAPI API    │
│  (marcaciones)  │     │  Google Sheets   │     │  (Railway)      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
┌─────────────────┐                               │   PostgreSQL    │
│  React Frontend │◀──────────────────────────────│   (Supabase)    │
│  (Vercel)       │    JWT Auth (Bearer)           └─────────────────┘
└─────────────────┘
```

---

## Instalación rápida

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Pruebas
El proyecto cuenta con una suite de 29 pruebas unitarias que validan la lógica de cálculo de nómina.
```bash
cd backend
python -m pytest
```

---

## Variables de entorno

**Backend (`.env`):**
- `DATABASE_URL`: Conexión a PostgreSQL.
- `JWT_SECRET_KEY`: Secreto para tokens.
- `MAKE_API_KEY`: Key para validar peticiones de Make.
- `CORS_ORIGINS`: Dominios permitidos (Vercel).

**Frontend (`.env`):**
- `VITE_API_URL`: URL del backend desplegado.

---

## Pantallas implementadas

| Pantalla | Descripción | Rol |
|---|---|---|
| Dashboard | Vista general de indicadores y alertas. | ADMIN, CONTADOR |
| Empleados | Gestión completa de la nómina de trabajadores. | ADMIN |
| Marcaciones | Control de asistencia y correcciones manuales. | ADMIN, CONTADOR |
| Nómina | Liquidación masiva de periodos quincenales. | ADMIN, CONTADOR |
| Reportes | Exportación de PILA y reportes de costos. | ADMIN, CONTADOR |
| Mi Nómina | Historial y comprobantes para el empleado. | EMPLEADO |

---

## Licencia
Este proyecto está bajo la licencia [MIT](LICENSE).
