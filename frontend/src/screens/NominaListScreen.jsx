import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { fakeNominas } from '../lib/fakeData';
import { formatCOP, formatHrs } from '../lib/formatters';

export default function NominaListScreen() {
  const navigate = useNavigate();
  const [estadoFilter, setEstadoFilter] = useState('todos');

  const filtered = estadoFilter === 'todos'
    ? fakeNominas
    : fakeNominas.filter(n => n.estado === estadoFilter);

  function openDetalle(n) {
    navigate('/nomina/liquidacion', { state: { nomina: n } });
  }

  return (
    <div>
      <PageHeader
        title="Nómina"
        subtitle="Liquidaciones quincenales · CST Colombia 2026"
        actions={<Button icon="plus">Liquidar quincena</Button>}
      />

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12 }}>
          <div style={{ flex: '0 0 220px' }}>
            <Select defaultValue="01-15-may">
              <option value="01-15-may">01–15 May 2026</option>
              <option value="16-30-abr">16–30 Abr 2026</option>
            </Select>
          </div>
          <div style={{ flex: '0 0 200px' }}>
            <Select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="APROBADO">Aprobado</option>
              <option value="PAGADO">Pagado</option>
            </Select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
            <thead>
              <tr>
                {['Empleado', 'Periodo', 'Días', 'Horas', 'Devengado', 'Deducciones', 'Neto a pagar', 'Estado', ''].map((h, i) => (
                  <th key={i} style={{
                    textAlign: [2,3,4,5,6].includes(i) ? 'right' : 'left',
                    padding: '10px 16px', background: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: 11, fontWeight: 600, color: '#6B7280',
                    textTransform: 'uppercase', letterSpacing: '.04em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => (
                <tr
                  key={n.id}
                  onClick={() => openDetalle(n)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={n.empNombre} />
                      <span style={{ color: '#111827', fontWeight: 500 }}>{n.empNombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151' }}>{n.periodo}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{n.diasHabiles}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatHrs(n.horasTrabajadas)}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCOP(n.devengado)}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCOP(n.deducciones)}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCOP(n.neto)}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <Badge status={n.estado}>{n.estado.charAt(0) + n.estado.slice(1).toLowerCase()}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#9CA3AF' }}>
                    <Icon name="chevRight" size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
