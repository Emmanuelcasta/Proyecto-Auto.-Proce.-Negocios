# Estado del proyecto — SysClock Nómina

> Última actualización: 6 de mayo de 2026

---

## Completado

### Backend (FastAPI)
- [x] Estructura del proyecto con FastAPI + SQLAlchemy async
- [x] Autenticación JWT — login, refresh token, logout
- [x] Middleware de roles (ADMIN, CONTADOR, EMPLEADO)
- [x] CRUD de empleados con paginación y soft-delete
- [x] Endpoint de configuración (SMMLV, auxilio de transporte, festivos)
- [x] Health check en `/api/v1/health`
- [x] Manejo centralizado de excepciones
- [x] Usuario admin creado automáticamente al iniciar
- [x] Configuración de CORS
- [x] Dockerfile + `railway.toml` para Railway
- [x] Migraciones con Alembic (configurado para async + Supabase)

### Base de datos
- [x] PostgreSQL en Supabase (Session Pooler)
- [x] Tablas: `usuarios`, `empleados`, `configuracion`, `alembic_version`
- [x] Script de inicialización: `backend/supabase_init.sql`

### Frontend (React + Vite)
- [x] Proyecto configurado con Vite 6 + React 18
- [x] Sistema de diseño completo (tokens CSS, paleta `#1A3A5C`, Inter)
- [x] Componentes reutilizables: Button, Input, Select, Card, Modal, Badge, Avatar, Sidebar, Topbar, PageHeader, KpiCard, EmptyState
- [x] Pantalla: **Login** — con autenticación real contra el backend
- [x] Pantalla: **Dashboard** — KPIs, gráfica de horas, alertas, últimas marcaciones
- [x] Pantalla: **Empleados** — CRUD completo conectado al backend
- [x] Pantalla: **Turnos** — ciclo de rotación (datos stub)
- [x] Pantalla: **Marcaciones** — tabla con corrección de marcación (datos stub)
- [x] Pantalla: **Nómina** — lista de quincenas (datos stub)
- [x] Pantalla: **Liquidación** — detalle de quincena con devengados/deducciones/aportes (datos stub)
- [x] Pantalla: **Reportes** — tarjetas de exportación PILA, horas extra, resumen
- [x] Sidebar con navegación activa
- [x] Topbar con usuario y fecha
- [x] Rutas protegidas por autenticación (`RequireAuth`)
- [x] Cliente HTTP (`fetch`) con refresh automático de JWT al recibir 401
- [x] Formateadores en locale colombiano: `formatCOP()`, `formatHrs()`

---

## Pendiente

### Frontend
- [ ] **Mi Nómina** — vista de empleado: historial de quincenas propias y descarga de comprobante
- [ ] **Comprobante** — pantalla de comprobante de pago descargable (PDF o vista imprimible)
- [ ] Migrar cliente HTTP de `fetch` a **Axios** con interceptores JWT configurados
- [ ] Rutas protegidas **por rol** (actualmente solo por autenticación; falta restringir vistas según ADMIN / CONTADOR / EMPLEADO)
- [ ] **`vercel.json`** para despliegue del frontend en Vercel (SPA redirect, variables de entorno)

### Integraciones externas
- [ ] **Google Forms** — crear formulario de marcación (entrada / salida) vinculado a Google Sheets
- [ ] **Google Sheets** — hoja de destino de respuestas del formulario con columnas: empleado, tipo, timestamp
- [ ] **Make (Integromat)** — escenario que escucha cambios en Google Sheets y hace `POST /api/v1/marcaciones` al backend (endpoint aún no existe)
- [ ] Endpoint `POST /api/v1/marcaciones` en el backend para recibir marcaciones desde Make

### DevOps / Monitoreo
- [ ] **UptimeRobot** — configurar monitor HTTP apuntando a `https://[tu-dominio]/api/v1/health` con intervalo de 5 minutos
- [ ] Variables de entorno de producción en Railway (`ENVIRONMENT=production`, `CORS_ORIGINS` con dominio Vercel)
- [ ] Variables de entorno en Vercel (`VITE_API_URL` apuntando al backend en Railway)

### Backend — funcionalidad de nómina
- [ ] Modelo y endpoint de **marcaciones** (recibir desde Make, listar por periodo)
- [ ] Motor de **liquidación de quincena** — cálculo de ordinarias, nocturnas, extras, festivos, deducciones PILA
- [ ] Generación de **comprobante de pago** (PDF o HTML imprimible)
- [ ] Endpoint **Mi Nómina** para rol EMPLEADO (solo ve sus propias quincenas)

---

## Orden de trabajo sugerido

```
1. vercel.json + despliegue frontend en Vercel
2. UptimeRobot apuntando al backend en Railway
3. Google Forms + Google Sheets (config manual)
4. Make: escenario Sheets → backend
5. Endpoint POST /marcaciones en backend
6. Motor de liquidación (cálculo real de nómina)
7. Pantalla Mi Nómina + Comprobante
8. Migración a Axios con interceptores
9. Restricciones de ruta por rol
```
