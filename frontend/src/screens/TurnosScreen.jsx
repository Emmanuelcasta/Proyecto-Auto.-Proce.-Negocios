import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Field from '../components/Field';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { TurnoPill } from '../components/Badge';
import { getCicloActivo, crearCiclo, getTurnosSemana, getEmpleados } from '../lib/api';

// Patrón de rotación fijo del negocio (3 bloques de 2 semanas)
const PATRON = [
  { bloque: 1, semana: 'Semana 1–2', A: 'TURNO_1', B: 'TURNO_1', C: 'TURNO_2' },
  { bloque: 2, semana: 'Semana 3–4', A: 'TURNO_1', B: 'TURNO_2', C: 'TURNO_1' },
  { bloque: 3, semana: 'Semana 5–6', A: 'TURNO_2', B: 'TURNO_1', C: 'TURNO_1' },
];

function formatFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
}

export default function TurnosScreen() {
  const [ciclo, setCiclo] = useState(null);
  const [semana, setSemana] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fechaInicioCiclo, setFechaInicioCiclo] = useState('');
  const [empA, setEmpA] = useState('');
  const [empB, setEmpB] = useState('');
  const [empC, setEmpC] = useState('');
  const [saving, setSaving] = useState(false);
  const userRole = localStorage.getItem('user_role');

  async function loadData() {
    setLoading(true);
    setError(null);
    const today = new Date().toISOString().split('T')[0];
    try {
      const [c, s, e] = await Promise.allSettled([
        getCicloActivo(),
        getTurnosSemana(today),
        getEmpleados({ limit: 500 }),
      ]);
      if (c.status === 'fulfilled') setCiclo(c.value);
      if (s.status === 'fulfilled') setSemana(s.value);
      if (e.status === 'fulfilled') setEmpleados(e.value?.empleados?.filter(x => x.activo) || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleCrearCiclo() {
    if (!fechaInicioCiclo || !empA || !empB || !empC) return;
    setSaving(true);
    try {
      await crearCiclo({
        fecha_inicio_ciclo: fechaInicioCiclo,
        empleado_a_id: parseInt(empA),
        empleado_b_id: parseInt(empB),
        empleado_c_id: parseInt(empC),
      });
      setShowModal(false);
      setFechaInicioCiclo('');
      setEmpA(''); setEmpB(''); setEmpC('');
      loadData();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  const bloqueActual = semana?.bloque ?? null;

  const nombreA = ciclo?.empleado_a_nombre || 'Empleado A';
  const nombreB = ciclo?.empleado_b_nombre || 'Empleado B';
  const nombreC = ciclo?.empleado_c_nombre || 'Empleado C';

  const subtitulo = ciclo
    ? `Ciclo activo · 6 semanas · inicia el ${formatFecha(ciclo.fecha_inicio_ciclo)}`
    : 'Sin ciclo activo configurado';

  return (
    <div>
      <PageHeader
        title="Turnos"
        subtitle={subtitulo}
        actions={
          userRole === 'ADMIN' && (
            <Button variant="secondary" icon="settings" onClick={() => setShowModal(true)}>
              Configurar ciclo
            </Button>
          )
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#111827' }}>
            Turno 1 — 6:00am a 2:00pm
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
            L–V: 8h brutas, 7h20min efectivos · Sábado: 6:00am a 12:00m, 5h40min efectivos.
            Sin recargo nocturno. 2 operarios.
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#111827' }}>
            Turno 2 — 2:00pm a 10:00pm
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
            L–V: 8h brutas, 7h20min efectivos · Sábado: 12:00m a 6:00pm, 5h40min efectivos.
            Recargo nocturno +35% en tramo 7pm–10pm. 1 operario.
          </p>
        </Card>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', color: '#991B1B', fontSize: 14, marginBottom: 16 }}>
          Error al cargar datos: {error}
        </div>
      )}

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>
            Ciclo de rotación
            {bloqueActual && (
              <span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
                · Bloque actual: {bloqueActual}
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            Cargando ciclo…
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
            <thead>
              <tr>
                {['Bloque', `${nombreA} (A)`, `${nombreB} (B)`, `${nombreC} (C)`].map((h, i) => (
                  <th key={i} style={{
                    textAlign: 'left', padding: '10px 16px',
                    background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
                    fontSize: 11, fontWeight: 600, color: '#6B7280',
                    textTransform: 'uppercase', letterSpacing: '.04em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PATRON.map(c => {
                const esActual = c.bloque === bloqueActual;
                return (
                  <tr key={c.bloque} style={esActual ? { background: '#F0F5FA' } : {}}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontWeight: 500, color: '#111827' }}>
                      {c.semana}
                      {esActual && (
                        <span style={{
                          marginLeft: 8, fontSize: 11, color: '#15314D',
                          background: '#E8F0F7', padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                        }}>ACTUAL</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}><TurnoPill turno={c.A} /></td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}><TurnoPill turno={c.B} /></td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}><TurnoPill turno={c.C} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Semana actual */}
        {semana && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, color: '#6B7280' }}>
            Semana {formatFecha(semana.semana_inicio)} – {formatFecha(semana.semana_fin)}
            {semana.empleados?.map(emp => (
              <span key={emp.empleado_id} style={{ marginLeft: 16 }}>
                <strong>{emp.empleado_nombre}</strong>: {emp.turno === 'TURNO_1' ? 'Turno 1' : 'Turno 2'}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Modal crear ciclo (solo ADMIN) */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Configurar ciclo de rotación"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button
              onClick={handleCrearCiclo}
              disabled={saving || !fechaInicioCiclo || !empA || !empB || !empC}
            >
              {saving ? 'Guardando…' : 'Crear ciclo'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Fecha de inicio" hint="Debe ser un lunes.">
            <Input
              type="date"
              value={fechaInicioCiclo}
              onChange={e => setFechaInicioCiclo(e.target.value)}
            />
          </Field>
          <Field label="Empleado A (posición A)">
            <Select value={empA} onChange={e => setEmpA(e.target.value)}>
              <option value="">Seleccionar empleado…</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Empleado B (posición B)">
            <Select value={empB} onChange={e => setEmpB(e.target.value)}>
              <option value="">Seleccionar empleado…</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Empleado C (posición C)">
            <Select value={empC} onChange={e => setEmpC(e.target.value)}>
              <option value="">Seleccionar empleado…</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </Field>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            Los tres empleados deben ser distintos. Se desactivará el ciclo anterior automáticamente.
          </p>
        </div>
      </Modal>
    </div>
  );
}
