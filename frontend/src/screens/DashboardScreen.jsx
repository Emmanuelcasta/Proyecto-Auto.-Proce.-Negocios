import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { TurnoPill } from '../components/Badge';
import Icon from '../components/Icon';
import { getEmpleados } from '../lib/api';
import { fakeMarcaciones, fakeSemana } from '../lib/fakeData';
import { formatHrs } from '../lib/formatters';

function HoursChart({ data }) {
  const max = Math.max(...data.map(d => d.horas));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, padding: '12px 4px 0' }}>
      {data.map(d => (
        <div key={d.dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            height: `${(d.horas / max) * 130}px`, width: '100%',
            background: '#1A3A5C', borderRadius: '4px 4px 0 0', position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: -20, left: 0, right: 0, textAlign: 'center',
              fontSize: 11, color: '#374151', fontVariantNumeric: 'tabular-nums',
            }}>{formatHrs(d.horas)}h</span>
          </div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{d.dia}</span>
        </div>
      ))}
    </div>
  );
}

function AlertRow({ tone, icon, title, desc, onClick }) {
  const tones = {
    warning: { bg: '#FEF3C7', fg: '#92400E', icon: '#F59E0B' },
    info:    { bg: '#E8F0F7', fg: '#15314D', icon: '#1A3A5C' },
    success: { bg: '#D1FAE5', fg: '#065F46', icon: '#10B981' },
  }[tone];
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: 12, borderRadius: 8, background: tones.bg,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ color: tones.icon, marginTop: 1 }}><Icon name={icon} size={18} /></div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: tones.fg }}>{title}</div>
        <div style={{ fontSize: 12, color: tones.fg, opacity: 0.8 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    getEmpleados({ activos: true }).then(data => {
      setEmpleados(data?.empleados || data || []);
    }).catch(() => {});
  }, []);

  const totalEmpleados = empleados.length || 3;
  const marcacionesHoy = fakeMarcaciones.filter(m => m.fecha === '2026-05-04');
  const completas = marcacionesHoy.filter(m => m.estado === 'completo').length;
  const sinMarcar = marcacionesHoy.filter(m => m.estado === 'incompleto').length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de la operación"
        actions={<Button variant="secondary" icon="download">Exportar resumen</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard icon="users"  label="Empleados activos"   value={String(totalEmpleados)} delta="Sin cambios" deltaTone="neutral" />
        <KpiCard icon="clock"  label="Marcaciones hoy"     value={`${completas} / ${marcacionesHoy.length}`} delta={`${sinMarcar} sin marcar`} deltaTone={sinMarcar > 0 ? 'warning' : 'positive'} />
        <KpiCard icon="file"   label="Nóminas pendientes"  value="2" delta="Aprobar antes del 15" deltaTone="warning" />
        <KpiCard icon="dollar" label="Neto del mes"        value="$5.527.080" delta="+2,1% vs abril" deltaTone="positive" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>Horas trabajadas — semana actual</h2>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Lun 27 abr — Sáb 02 may</span>
          </div>
          <HoursChart data={fakeSemana} />
        </Card>
        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: '#111827' }}>Alertas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AlertRow tone="warning" icon="alert" title="Juan Torres no ha marcado salida hoy" desc="Última entrada 06:14" />
            <AlertRow tone="info" icon="info" title="Quincena 1–15 may en borrador" desc="2 nóminas pendientes de aprobación" onClick={() => navigate('/nomina')} />
            <AlertRow tone="success" icon="check" title="Marcación corregida" desc="Carlos Ramírez · 03 may · justificada" />
          </div>
        </Card>
      </div>

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>Últimas marcaciones</h2>
          <Button size="sm" variant="ghost" iconRight="chevRight" onClick={() => navigate('/marcaciones')}>Ver todas</Button>
        </div>
        <MarcacionesCompact rows={fakeMarcaciones.slice(0, 5)} />
      </Card>
    </div>
  );
}

function MarcacionesCompact({ rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
        <thead>
          <tr>
            {['Empleado', 'Fecha', 'Turno', 'Entrada', 'Salida', 'Horas ef.', 'Estado'].map((h, i) => (
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
          {rows.map(r => (
            <tr key={r.id}>
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
              <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.horas ? formatHrs(r.horas) : '—'}</td>
              <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <Badge status={r.estado}>{r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
