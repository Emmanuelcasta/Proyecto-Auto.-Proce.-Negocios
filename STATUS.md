# Estado del proyecto — SysClock Nómina

> Última actualización: 8 de mayo de 2026
> **ESTADO: COMPLETADO**

---

## Completado

### Backend (FastAPI)
- [x] Estructura del proyecto con FastAPI + SQLAlchemy async
- [x] Autenticación JWT — login, refresh token, logout
- [x] Middleware de roles (ADMIN, CONTADOR, EMPLEADO)
- [x] CRUD de empleados con paginación y soft-delete
- [x] Endpoint de configuración (SMMLV, auxilio de transporte, festivos)
- [x] Health check en `/api/v1/health` para UptimeRobot
- [x] Manejo centralizado de excepciones y auditoría
- [x] Usuario admin creado automáticamente al iniciar
- [x] Configuración de CORS para Vercel y Railway
- [x] Dockerfile + `railway.toml` para Railway
- [x] Migraciones con Alembic (configurado para async + Supabase)
- [x] **Motor de liquidación**: cálculo de recargos nocturnos, extras, festivos y PILA.
- [x] **Endpoint Marcaciones**: recepción desde Google Forms (via Make) con API Key.
- [x] **Reportes**: generación de Excel PILA, resumen de costos y reporte de extras.
- [x] **Mi Nómina**: endpoints específicos para el empleado.

### Base de datos
- [x] PostgreSQL en Supabase (Session Pooler)
- [x] Tablas: `usuarios`, `empleados`, `configuracion`, `marcaciones`, `nomina`, `detalle_nomina`
- [x] Script de inicialización y migraciones Alembic

### Frontend (React + Vite)
- [x] Proyecto configurado con Vite 6 + React 18
- [x] Sistema de diseño premium (tokens CSS, paleta `#1A3A5C`, Inter)
- [x] Componentes reutilizables: Button, Card, Modal, Sidebar, Topbar, etc.
- [x] Pantalla: **Login** — con autenticación real
- [x] Pantalla: **Dashboard** — KPIs reales conectados al backend
- [x] Pantalla: **Empleados** — CRUD completo
- [x] Pantalla: **Turnos** — visualización de ciclo de rotación
- [x] Pantalla: **Marcaciones** — tabla con corrección manual (solo ADMIN)
- [x] Pantalla: **Nómina** — gestión de periodos y liquidación
- [x] Pantalla: **Liquidación** — detalle de quincena (devengados/deducciones)
- [x] Pantalla: **Reportes** — generación de PILA (Excel) y resúmenes conectada al API
- [x] Pantalla: **Mi Nómina** — historial propio para empleados
- [x] **Vercel.json**: configurado para SPA y redirecciones
- [x] Navegación condicional por rol (ADMIN, CONTADOR, EMPLEADO)

### DevOps / Pruebas
- [x] **Suite de Pruebas (29 tests)**: Validado el 100% de la lógica de nómina.
- [x] Configuración de despliegue continuo en Railway y Vercel.

---

## Entregables Finales
1. Código fuente completo (Backend y Frontend).
2. Script de base de datos y migraciones.
3. Suite de pruebas unitarias automatizadas.
4. Documentación de instalación y uso (README).
5. Archivos de configuración para la nube (Dockerfile, railway.toml, vercel.json).
