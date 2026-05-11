import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Field from '../components/Field';
import { getMarcaciones, corregirMarcacion, getEmpleados } from '../lib/api';
import { formatHrs } from '../lib/formatters';

function formatTime(ts) {
  if (!ts) return null;
  // "2026-05-04T06:02:00" or "2026-05-04T06:02:00-05:00"
  const t = ts.includes('T') ? ts.split('T')[1] : ts;
  return t.slice(0, 5);
}

function derivarEstado(m) {
  if (m.corregido_por) return 'corregido';
  if (!m.timestamp_salida) return 'incompleto';
  return 'completo';
}

export default function MarcacionesScreen() {
  const [marcaciones, setMarcaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoMap, setEmpleadoMap] = useState({});
  const [empFilter, setEmpFilter] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalRow, setModalRow] = useState(null);
  const [entradaInput, setEntradaInput] = useState('');
  const [salidaInput, setSalidaInput] = useState('');
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);
  const userRole = localStorage.getItem('user_role');

  const loadMarcaciones = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarcaciones(params);
      setMarcaciones(data?.marcaciones || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getEmpleados({ limit: 500 }).then(data => {
      const list = data?.empleados || [];
      setEmpleados(list);
      const map = {};
      list.forEach(e => { map[e.id] = e.nombre; });
      setEmpleadoMap(map);
    }).catch(() => {});
    loadMarcaciones();
  }, [loadMarcaciones]);

  function applyFilters() {
    const params = {};
    if (empFilter) params.empleado_id = empFilter;
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;
    loadMarcaciones(params);
  }

  function openModal(r) {
    setModalRow(r);
    setEntradaInput(formatTime(r.timestamp_entrada) || '');
    setSalidaInput(formatTime(r.timestamp_salida) || '');
    setNota('');
  }

  async function saveCorreccion() {
    if (!nota.trim() || nota.trim().length < 10) return;
    setSaving(true);
    try {
      const payload = {
        marcacion_id: modalRow.id,
        nota_correccion: nota.trim(),
      };
      if (entradaInput) payload.timestamp_entrada = `${modalRow.fecha}T${entradaInput}:00`;
      if (salidaInput) payload.timestamp_salida = `${modalRow.fecha}T${salidaInput}:00`;
      await corregirMarcacion(payload);
      setModalRow(null);
      applyFilters();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Marcaciones"
        subtitle="Registro de entradas y salidas vía Google Forms"
        actions={<Button variant="secondary" icon="download">Exportar</Button>}
      />

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: '0 0 220px' }}>
            <Select value={empFilter} onChange={e => setEmpFilter(e.target.value)}>
              <option value="">Todos los empleados</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </div>
          <div style={{ flex: '0 0 160px' }}>
            <Input
              type="date"
              placeholder="Fecha inicio"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 0 160px' }}>
            <Input
              type="date"
              placeholder="Fecha fin"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={applyFilters}>Filtrar</Button>
          <div style={{ flex: 1 }} />
        </div>

        {error && (
          <div style={{ padding: '16px 24px', color: '#991B1B', fontSize: 14 }}>
            Error al cargar marcaciones: {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            Cargando marcaciones…
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
              <thead>
                <tr>
                  {['Empleado', 'Fecha', 'Entrada', 'Salida', 'Horas ef.', 'Fuente', 'Estado', 'Acciones'].map((h, i) => (
                    <th key={h} style={{
                      textAlign: [2, 3, 4].includes(i) ? 'right' : 'left',
                      padding: '10px 16px', background: '#F9FAFB',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: 11, fontWeight: 600, color: '#6B7280',
                      textTransform: 'uppercase', letterSpacing: '.04em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marcaciones.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#6B7280' }}>
                      No se encontraron marcaciones con los filtros aplicados.
                    </td>
                  </tr>
                ) : marcaciones.map(r => {
                  const estado = derivarEstado(r);
                  const entrada = formatTime(r.timestamp_entrada);
                  const salida = formatTime(r.timestamp_salida);
                  const nombre = empleadoMap[r.empleado_id] || `Empleado #${r.empleado_id}`;
                  return (
                    <tr key={r.id}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={nombre} size={28} />
                          <span style={{ color: '#111827', fontWeight: 500 }}>{nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{r.fecha}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{entrada || '—'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{salida || '—'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                        {r.horas_efectivas ? formatHrs(parseFloat(r.horas_efectivas)) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#6B7280', fontSize: 12 }}>
                        {r.fuente === 'FORM' ? 'Google Forms' : r.fuente === 'CORRECCION' ? 'Corrección' : r.fuente}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        <Badge status={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</Badge>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        {userRole === 'ADMIN' && (
                          <Button size="sm" variant="ghost" icon="edit" onClick={() => openModal(r)}>Corregir</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!modalRow}
        onClose={() => setModalRow(null)}
        title="Corregir marcación"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRow(null)}>Cancelar</Button>
            <Button
              onClick={saveCorreccion}
              disabled={nota.trim().length < 10 || saving}
            >
              {saving ? 'Guardando…' : 'Guardar corrección'}
            </Button>
          </>
        }
      >
        {modalRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#F7F8FA', borderRadius: 8 }}>
              <Avatar name={empleadoMap[modalRow.empleado_id] || `#${modalRow.empleado_id}`} />
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>
                  {empleadoMap[modalRow.empleado_id] || `Empleado #${modalRow.empleado_id}`}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  {modalRow.fecha} · {formatTime(modalRow.timestamp_entrada) || '—'} → {formatTime(modalRow.timestamp_salida) || '—'}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Hora entrada">
                <Input
                  type="time"
                  value={entradaInput}
                  onChange={e => setEntradaInput(e.target.value)}
                />
              </Field>
              <Field label="Hora salida">
                <Input
                  type="time"
                  value={salidaInput}
                  onChange={e => setSalidaInput(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Justificación" hint="Mínimo 10 caracteres. Queda registrada con tu usuario y fecha.">
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                rows={3}
                placeholder="Ej. Empleado olvidó marcar salida; verificado con supervisor."
                style={{
                  padding: 12, border: '1px solid #E5E7EB', borderRadius: 8,
                  fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
