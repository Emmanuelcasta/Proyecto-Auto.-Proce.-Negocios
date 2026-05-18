import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { getEmpleados, getMarcaciones, historialNomina } from '../lib/api';
import { formatHrs } from '../lib/formatters';

function formatTime(ts) {
  if (!ts) return null;
  const t = ts.includes('T') ? ts.split('T')[1] : ts;
  return t.slice(0, 5);
}

function derivarEstado(m) {
  if (m.corregido_por) return 'corregido';
  if (!m.timestamp_salida) return 'incompleto';
  return 'completo';
}

function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function HoursChart({ data }) {
  const max = Math.max(...data.map(d => d.horas), 1);
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
  const [marcaciones, setMarcaciones] = useState([]);
  const [nominas, setNominas] = useState([]);
  const [weekMarcaciones, setWeekMarcaciones] = useState([]);
  const [empleadoMap, setEmpleadoMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Calculate current week dates (Monday to Saturday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.getFullYear(), today.getMonth(), diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const saturday = new Date(monday.getTime() + 5 * 24 * 60 * 60 * 1000);
  saturday.setHours(23, 59, 59, 999);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const mondayStr = formatDate(monday);
  const saturdayStr = formatDate(saturday);
  const todayStr = formatDate(new Date());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getEmpleados({ limit: 500 }),
      getMarcaciones({ limit: 100 }),
      historialNomina(),
      getMarcaciones({ fecha_inicio: mondayStr, fecha_fin: saturdayStr })
    ]).then(([empData, marcData, nominaData, weekMarcData]) => {
      const empList = empData?.empleados || empData || [];
      setEmpleados(empList);
      
      const map = {};
      empList.forEach(e => { map[e.id] = e.nombre; });
      setEmpleadoMap(map);

      setMarcaciones(marcData?.marcaciones || marcData || []);
      setNominas(nominaData?.nominas || nominaData || []);
      setWeekMarcaciones(weekMarcData?.marcaciones || weekMarcData || []);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading dashboard data:", err);
      setLoading(false);
    });
  }, [mondayStr, saturdayStr]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
        Cargando métricas del Dashboard…
      </div>
    );
  }

  // --- Calculations for KPIs ---
  const totalEmpleados = empleados.length;
  
  const todayMarc = marcaciones.filter(m => m.fecha === todayStr);
  const completas = todayMarc.filter(m => m.timestamp_salida).length;
  const sinMarcar = Math.max(0, totalEmpleados - completas);

  const pendingNominas = nominas.filter(n => n.state === 'borrador' || n.estado === 'borrador');
  
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nominasMes = nominas.filter(n => {
    const d = new Date(n.fecha_fin);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalNeto = nominasMes.reduce((sum, n) => sum + (parseFloat(n.neto_pagar) || 0), 0);

  // --- Calculations for Weekly Chart ---
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const chartData = diasSemana.map((dia, index) => {
    const targetDate = new Date(monday.getTime() + index * 24 * 60 * 60 * 1000);
    const targetDateStr = formatDate(targetDate);
    const dayMarc = weekMarcaciones.filter(m => m.fecha === targetDateStr);
    const horas = dayMarc.reduce((sum, m) => sum + (parseFloat(m.horas_efectivas) || 0), 0);
    return { dia, horas };
  });

  const options = { day: 'numeric', month: 'short' };
  const labelSemana = `${monday.toLocaleDateString('es-CO', options)} — ${saturday.toLocaleDateString('es-CO', options)}`;

  // --- Calculations for Alerts ---
  const alertsList = [];
  
  const sinSalidaHoy = todayMarc.filter(m => !m.timestamp_salida && m.timestamp_entrada);
  sinSalidaHoy.forEach(m => {
    const nombre = empleadoMap[m.empleado_id] || `Empleado #${m.empleado_id}`;
    alertsList.push({
      id: `sin-salida-${m.id}`,
      tone: 'warning',
      icon: 'alert',
      title: `${nombre} no ha marcado salida hoy`,
      desc: `Última entrada ${formatTime(m.timestamp_entrada) || '—'}`
    });
  });

  if (pendingNominas.length > 0) {
    alertsList.push({
      id: 'nomina-borrador',
      tone: 'info',
      icon: 'info',
      title: `Nómina en borrador`,
      desc: `${pendingNominas.length} liquidaciones pendientes de aprobación`,
      onClick: () => navigate('/nomina')
    });
  }

  if (alertsList.length === 0) {
    alertsList.push({
      id: 'all-ok',
      tone: 'success',
      icon: 'check',
      title: 'Operación al día',
      desc: 'No se registran marcaciones pendientes ni novedades de nómina hoy.'
    });
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de la operación"
        actions={<Button variant="secondary" icon="download">Exportar resumen</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard icon="users"  label="Empleados activos"   value={String(totalEmpleados)} delta="Sin cambios" deltaTone="neutral" />
        <KpiCard icon="clock"  label="Marcaciones hoy"     value={`${completas} / ${totalEmpleados}`} delta={`${sinMarcar} sin marcar`} deltaTone={sinMarcar > 0 ? 'warning' : 'positive'} />
        <KpiCard icon="file"   label="Nóminas pendientes"  value={String(pendingNominas.length)} delta="Aprobar antes del 15" deltaTone="warning" />
        <KpiCard icon="dollar" label="Neto del mes"        value={formatCOP(totalNeto)} delta="Periodo actual" deltaTone="positive" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>Horas trabajadas — semana actual</h2>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{labelSemana}</span>
          </div>
          <HoursChart data={chartData} />
        </Card>
        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: '#111827' }}>Alertas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alertsList.map(alert => (
              <AlertRow
                key={alert.id}
                tone={alert.tone}
                icon={alert.icon}
                title={alert.title}
                desc={alert.desc}
                onClick={alert.onClick}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>Últimas marcaciones</h2>
          <Button size="sm" variant="ghost" iconRight="chevRight" onClick={() => navigate('/marcaciones')}>Ver todas</Button>
        </div>
        <MarcacionesCompact rows={marcaciones.slice(0, 5)} empleadoMap={empleadoMap} />
      </Card>
    </div>
  );
}

function MarcacionesCompact({ rows, empleadoMap }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
        <thead>
          <tr>
            {['Empleado', 'Fecha', 'Entrada', 'Salida', 'Horas ef.', 'Estado'].map((h, i) => (
              <th key={h} style={{
                textAlign: i >= 2 && i <= 4 ? 'right' : 'left',
                padding: '10px 16px', background: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontSize: 11, fontWeight: 600, color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: '.04em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>
                No hay marcaciones registradas recientemente.
              </td>
            </tr>
          ) : (
            rows.map(r => {
              const nombre = empleadoMap[r.empleado_id] || `Empleado #${r.empleado_id}`;
              const estado = derivarEstado(r);
              return (
                <tr key={r.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={nombre} size={28} />
                      <span style={{ color: '#111827', fontWeight: 500 }}>{nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{r.fecha}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{formatTime(r.timestamp_entrada) || '—'}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{formatTime(r.timestamp_salida) || '—'}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {r.horas_efectivas ? formatHrs(parseFloat(r.horas_efectivas)) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <Badge status={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</Badge>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
