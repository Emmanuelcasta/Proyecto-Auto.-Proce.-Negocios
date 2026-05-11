const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';

function getToken() {
  return localStorage.getItem('access_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(method, path, body);
    localStorage.clear();
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function tryRefresh() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// Auth
export async function login(email, password) {
  const data = await request('POST', '/auth/login', { email, password });
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('user_email', email);
  localStorage.setItem('user_role', data.rol || 'ADMIN');
  return data;
}

export async function logout() {
  try { await request('POST', '/auth/logout'); } catch { /* ignore */ }
  localStorage.clear();
}

// Empleados
export function getEmpleados(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/empleados${q ? '?' + q : ''}`);
}

export function createEmpleado(data) {
  return request('POST', '/empleados', data);
}

export function updateEmpleado(id, data) {
  return request('PUT', `/empleados/${id}`, data);
}

export function deleteEmpleado(id) {
  return request('DELETE', `/empleados/${id}`);
}

// Configuracion
export function getConfiguracion() {
  return request('GET', '/configuracion');
}

export function updateConfiguracion(data) {
  return request('PUT', '/configuracion', data);
}

// Reportes
export function getReportePilaUrl(periodo) {
  const token = localStorage.getItem('access_token');
  // Hack for downloading files with auth
  return `${BASE}/reportes/pila?periodo=${periodo}&token=${token}`; // Usually needs a different approach or just fetch and createObjectURL
}

export async function downloadPila(periodo) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}/reportes/pila?periodo=${periodo}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al generar PILA');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PILA_${periodo}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function getResumenMes(year, month) {
  return request('GET', `/reportes/resumen-mes?year=${year}&month=${month}`);
}

export function getHorasExtra(fecha_inicio, fecha_fin) {
  return request('GET', `/reportes/horas-extra?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`);
}

// Marcaciones
export function getMarcaciones(params = {}) {
  const q = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return request('GET', `/marcaciones${q ? '?' + q : ''}`);
}

export function corregirMarcacion(data) {
  return request('POST', '/marcaciones/correccion', data);
}

// Turnos
export function getCicloActivo() {
  return request('GET', '/turnos/ciclo');
}

export function crearCiclo(data) {
  return request('POST', '/turnos/ciclo', data);
}

export function getTurnosSemana(fecha) {
  return request('GET', `/turnos/semana?fecha=${fecha}`);
}

// Nómina
export function historialNomina(empleado_id = null) {
  const q = empleado_id ? `?empleado_id=${empleado_id}` : '';
  return request('GET', `/nomina/historial${q}`);
}

export function liquidarQuincena(data) {
  return request('POST', '/nomina/liquidar', data);
}

export function getNomina(id) {
  return request('GET', `/nomina/${id}`);
}

export function aprobarNomina(id) {
  return request('PUT', `/nomina/${id}/aprobar`);
}

export function marcarNominaPagada(id) {
  return request('PUT', `/nomina/${id}/marcar-pagado`);
}

export async function downloadComprobante(id) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}/nomina/${id}/comprobante`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al generar comprobante');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comprobante_nomina_${id}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Empleado self-service
export function getMiNomina() {
  return request('GET', '/mi-nomina');
}

export function getMiNominaDetalle(id) {
  return request('GET', `/mi-nomina/${id}`);
}

export function getMiMarcaciones() {
  return request('GET', '/mi-marcaciones');
}
