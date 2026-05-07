import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Avatar from '../components/Avatar';
import Badge, { TurnoPill } from '../components/Badge';
import Modal from '../components/Modal';
import Field from '../components/Field';
import { fakeMarcaciones } from '../lib/fakeData';
import { formatHrs } from '../lib/formatters';

const EMPLEADOS = [
  { id: 1, nombre: 'Carlos Ramírez' },
  { id: 2, nombre: 'Laura Méndez' },
  { id: 3, nombre: 'Juan Torres' },
];

export default function MarcacionesScreen() {
  const [empFilter, setEmpFilter] = useState('todos');
  const [modalRow, setModalRow] = useState(null);
  const [nota, setNota] = useState('');

  const filtered = empFilter === 'todos'
    ? fakeMarcaciones
    : fakeMarcaciones.filter(m => m.empId === Number(empFilter));

  return (
    <div>
      <PageHeader
        title="Marcaciones"
        subtitle="Registro de entradas y salidas vía Google Forms"
        actions={<Button variant="secondary" icon="download">Exportar</Button>}
      />

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: '0 0 240px' }}>
            <Input icon="search" placeholder="Buscar por empleado…" />
          </div>
          <div style={{ flex: '0 0 220px' }}>
            <Select value={empFilter} onChange={e => setEmpFilter(e.target.value)}>
              <option value="todos">Todos los empleados</option>
              {EMPLEADOS.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </div>
          <div style={{ flex: '0 0 180px' }}>
            <Input placeholder="01/05/26 – 04/05/26" icon="calendar" />
          </div>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" icon="filter" size="sm">Más filtros</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
            <thead>
              <tr>
                {['Empleado', 'Fecha', 'Turno', 'Entrada', 'Salida', 'Horas ef.', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i >= 3 && i <= 5 ? 'right' : 'left',
                    padding: '10px 16px', background: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: 11, fontWeight: 600, color: '#6B7280',
                    textTransform: 'uppercase', letterSpacing: '.04em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={r.empNombre} size={28} />
                      <span style={{ color: '#111827', fontWeight: 500 }}>{r.empNombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{r.fecha}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}><TurnoPill turno={r.turno} /></td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.entrada || '—'}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.salida || '—'}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {r.horas ? formatHrs(r.horas) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <Badge status={r.estado}>{r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => { setModalRow(r); setNota(''); }}>Corregir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!modalRow}
        onClose={() => setModalRow(null)}
        title="Corregir marcación"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRow(null)}>Cancelar</Button>
            <Button onClick={() => setModalRow(null)} disabled={!nota.trim()}>Guardar corrección</Button>
          </>
        }
      >
        {modalRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#F7F8FA', borderRadius: 8 }}>
              <Avatar name={modalRow.empNombre} />
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>{modalRow.empNombre}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  {modalRow.fecha} · {modalRow.entrada || '—'} → {modalRow.salida || '—'}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Hora entrada"><Input defaultValue={modalRow.entrada || ''} /></Field>
              <Field label="Hora salida"><Input defaultValue={modalRow.salida || ''} /></Field>
            </div>
            <Field label="Justificación" hint="La corrección queda registrada con tu usuario y fecha.">
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                rows={3}
                placeholder="Ej. Empleado olvidó marcar salida; verificado con supervisor."
                style={{
                  padding: 12, border: '1px solid #E5E7EB', borderRadius: 8,
                  fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', width: '100%',
                }}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
