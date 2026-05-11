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

## API — Endpoints

Base URL: `/api/v1`

### Autenticación
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login con email/password → access + refresh tokens | — |
| POST | `/auth/refresh` | Renueva el access token | — |
| POST | `/auth/logout` | Cierra sesión | JWT |

### Empleados
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/empleados` | Listar empleados (paginado: `skip`, `limit`) | JWT + ADMIN |
| POST | `/empleados` | Crear empleado | JWT + ADMIN |
| GET | `/empleados/{id}` | Obtener empleado por ID | JWT + ADMIN |
| PUT | `/empleados/{id}` | Actualizar empleado | JWT + ADMIN |
| DELETE | `/empleados/{id}` | Desactivar empleado (soft delete) | JWT + ADMIN |

### Marcaciones
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/marcaciones/form` | Registrar marcación desde Make/Google Forms | API Key (`X-Make-Api-Key`) |
| GET | `/marcaciones` | Listar marcaciones (filtros: `empleado_id`, `fecha_inicio`, `fecha_fin`) | JWT |
| POST | `/marcaciones/correccion` | Corrección manual con justificación (auditoría) | JWT + ADMIN |
| GET | `/marcaciones/resumen` | Resumen de horas por empleado y periodo | JWT |

### Turnos
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/turnos/ciclo` | Obtener ciclo de rotación activo con nombres de empleados | JWT |
| POST | `/turnos/ciclo` | Crear nuevo ciclo de rotación (fecha inicio debe ser lunes) | JWT + ADMIN |
| GET | `/turnos/semana` | Turno de cada empleado en una semana (`fecha` param) | JWT |

### Nómina
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/nomina/liquidar` | Generar liquidación quincenal → estado BORRADOR | JWT + ADMIN/CONTADOR |
| GET | `/nomina/historial` | Historial de nóminas (opcional: `empleado_id`) | JWT + ADMIN/CONTADOR |
| GET | `/nomina/{id}` | Detalle completo de una nómina (incluye detalles) | JWT + ADMIN/CONTADOR |
| PUT | `/nomina/{id}/aprobar` | Aprobar nómina BORRADOR → APROBADO | JWT + ADMIN |
| PUT | `/nomina/{id}/marcar-pagado` | Marcar APROBADO → PAGADO | JWT + ADMIN/CONTADOR |
| GET | `/nomina/{id}/comprobante` | Descargar comprobante en formato DOCX | JWT + ADMIN/CONTADOR |

### Reportes
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/reportes/pila` | Descargar planilla PILA en Excel (`periodo=YYYY-MM`) | JWT + ADMIN/CONTADOR |
| GET | `/reportes/resumen-mes` | Resumen de costos del mes (`year`, `month`) | JWT + ADMIN/CONTADOR |
| GET | `/reportes/horas-extra` | Reporte de horas extra en rango de fechas | JWT + ADMIN/CONTADOR |

### Autoservicio (Empleado)
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/mi-nomina` | Historial de nóminas propias | JWT + EMPLEADO |
| GET | `/mi-nomina/{id}` | Detalle de nómina propia | JWT + EMPLEADO |
| GET | `/mi-marcaciones` | Marcaciones propias | JWT + EMPLEADO |

### Configuración y Salud
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/configuracion` | Parámetros globales (SMMLV, auxilio de transporte, festivos) | JWT + ADMIN |
| PUT | `/configuracion` | Actualizar parámetros globales | JWT + ADMIN |
| GET | `/health` | Health check | — |

---

## Flujo de estados de nómina

```
BORRADOR → APROBADO → PAGADO
```

- **BORRADOR**: Generado por `/nomina/liquidar`. Revisable antes de aprobar.
- **APROBADO**: Aprobado por ADMIN. Listo para pago.
- **PAGADO**: Confirmado como pagado.

---

## Pantallas implementadas

| Pantalla | Descripción | Rol | Datos |
|----------|-------------|-----|-------|
| Dashboard | Vista general de indicadores y alertas | ADMIN, CONTADOR | API real |
| Empleados | Gestión completa (CRUD) de la nómina de trabajadores | ADMIN | API real |
| Marcaciones | Control de asistencia con filtros y corrección manual | ADMIN, CONTADOR | API real |
| Turnos | Ciclo de rotación 3×2 semanas con configuración de nuevo ciclo | ADMIN, CONTADOR | API real |
| Nómina | Historial y liquidación de periodos quincenales | ADMIN, CONTADOR | API real |
| Liquidación | Detalle completo de una quincena: devengados, deducciones, aportes | ADMIN, CONTADOR | API real |
| Reportes | Exportación PILA (Excel) y reportes de costos | ADMIN, CONTADOR | API real |
| Mi Nómina | Historial y comprobantes para el empleado | EMPLEADO | API real |
| Configuración | Parámetros SMMLV, auxilio de transporte y festivos | ADMIN | API real |

---

## Licencia
Este proyecto está bajo la licencia [MIT](LICENSE).
