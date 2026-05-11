import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { getNomina, aprobarNomina, marcarNominaPagada, downloadComprobante } from '../lib/api';
import { formatCOP, formatHrs } from '../lib/formatters';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} ${MESES[parseInt(m)-1]} ${y}`;
}

function MiniStat({ label, value }) {
  return (
    <Card padding={16}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </Card>
  );
}

function SummaryLine({ label, value, bold, negative }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '4px 0',
      fontSize: bold ? 15 : 14, fontWeight: bold ? 600 : 400,
      color: bold ? '#111827' : '#374151', fontVariantNumeric: 'tabular-nums',
    }}>
      <span>{label}</span>
      <span style={{ color: negative ? '#991B1B' : (bold ? '#111827' : '#374151') }}>{value}</span>
    </div>
  );
}

function DetalleSection({ title, rows, columns, total, muted }) {
  return (
    <Card padding={0}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: muted ? '#6B7280' : '#111827' }}>{title}</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{
                textAlign: i === 0 ? 'left' : 'right',
                padding: '10px 24px', borderBottom: '1px solid #E5E7EB',
                fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '.04em', background: '#F9FAFB',
              }}>{c || ''}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: '10px 24px', borderBottom: '1px solid #F3F4F6', color: muted ? '#6B7280' : '#374151' }}>{r.a}</td>
              <td style={{ padding: '10px 24px', borderBottom: '1px solid #F3F4F6', color: '#6B7280', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.b || ''}</td>
              <td style={{ padding: '10px 24px', borderBottom: '1px solid #F3F4F6', color: '#6B7280', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.c || ''}</td>
              <td style={{ padding: '10px 24px', borderBottom: '1px solid #F3F4F6', color: muted ? '#6B7280' : '#111827', fontWeight: 500, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.d}</td>
            </tr>
          ))}
          {total && (
            <tr style={{ background: '#F9FAFB' }}>
              <td colSpan={3} style={{ padding: '12px 24px', color: '#111827', fontWeight: 600 }}>{total[0]}</td>
              <td style={{ padding: '12px 24px', color: '#111827', fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{total[1]}</td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

export default function LiquidacionScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const nominaId = state?.nominaId;
  const empNombreNav = state?.empNombre || '';

  const [nomina, setNomina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(false);
  const userRole = localStorage.getItem('user_role');

  useEffect(() => {
    if (!nominaId) { setLoading(false); return; }
    getNomina(nominaId)
      .then(data => { setNomina(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [nominaId]);

  async function handleAprobar() {
    setWorking(true);
    try {
      const updated = await aprobarNomina(nomina.id);
      setNomina(updated);
    } catch (e) {
      alert(e.message);
    } finally {
      setWorking(false);
    }
  }

  async function handleMarcarPagado() {
    setWorking(true);
    try {
      const updated = await marcarNominaPagada(nomina.id);
      setNomina(updated);
    } catch (e) {
      alert(e.message);
    } finally {
      setWorking(false);
    }
  }

  async function handleDownload() {
    setWorking(true);
    try {
      await downloadComprobante(nomina.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <div>
        <Button variant="link" onClick={() => navigate('/nomina')} style={{ marginBottom: 12 }}>← Volver a Nómina</Button>
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Cargando liquidación…</div>
      </div>
    );
  }

  if (error || !nomina) {
    return (
      <div>
        <Button variant="link" onClick={() => navigate('/nomina')} style={{ marginBottom: 12 }}>← Volver a Nómina</Button>
        <div style={{ padding: 40, textAlign: 'center', color: '#991B1B' }}>
          {error || 'No se encontró la nómina.'}
        </div>
      </div>
    );
  }

  const detalles = nomina.detalles || [];
  const devengados = detalles.filter(x => x.categoria === 'DEVENGADO');
  const deducciones = detalles.filter(x => x.categoria === 'DEDUCCION');
  const aportes = detalles.filter(x => x.categoria === 'APORTE_EMPLEADOR');
  const horasDetalle = devengados.filter(x => x.horas !== null && x.horas !== undefined);

  const totalDevengado = parseFloat(nomina.total_devengado);
  const totalDeducciones = parseFloat(nomina.total_deducciones);
  const neto = parseFloat(nomina.neto_pagar);

  const titulo = `Liquidación · ${empNombreNav || `Empleado #${nomina.empleado_id}`}`;
  const subtitulo = `${formatFecha(nomina.fecha_inicio)} – ${formatFecha(nomina.fecha_fin)}`;

  return (
    <div>
      <Button variant="link" onClick={() => navigate('/nomina')} style={{ marginBottom: 12 }}>← Volver a Nómina</Button>
      <PageHeader
        title={titulo}
        subtitle={subtitulo}
        actions={
          <>
            <Button variant="secondary" icon="download" onClick={handleDownload} disabled={working}>
              Descargar comprobante
            </Button>
            {nomina.estado === 'BORRADOR' && userRole === 'ADMIN' && (
              <Button icon="check" onClick={handleAprobar} disabled={working}>
                {working ? 'Procesando…' : 'Aprobar'}
              </Button>
            )}
            {nomina.estado === 'APROBADO' && (userRole === 'ADMIN' || userRole === 'CONTADOR') && (
              <Button onClick={handleMarcarPagado} disabled={working}>
                {working ? 'Procesando…' : 'Marcar como Pagado'}
              </Button>
            )}
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <MiniStat label="Días hábiles" value={`${nomina.dias_habiles_quincena} / ${nomina.dias_habiles_mes}`} />
        <MiniStat label="Umbral horas" value={formatHrs(parseFloat(nomina.umbral_horas))} />
        <MiniStat label="Horas trabajadas" value={formatHrs(parseFloat(nomina.total_horas_trabajadas))} />
        <MiniStat label="Estado" value={<Badge status={nomina.estado}>{nomina.estado.charAt(0) + nomina.estado.slice(1).toLowerCase()}</Badge>} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {horasDetalle.length > 0 && (
            <DetalleSection
              title="Detalle de horas"
              columns={['Concepto', 'Horas', 'Recargo', 'Valor']}
              rows={horasDetalle.map(r => ({
                a: r.concepto,
                b: formatHrs(parseFloat(r.horas)),
                c: r.porcentaje ? `+${parseFloat(r.porcentaje).toFixed(0)}%` : '—',
                d: formatCOP(parseFloat(r.valor)),
              }))}
            />
          )}

          {devengados.length > 0 && (
            <DetalleSection
              title="Devengados"
              columns={['Concepto', '', '', 'Valor']}
              rows={devengados.map(r => ({ a: r.concepto, d: formatCOP(parseFloat(r.valor)) }))}
              total={['Total devengado', formatCOP(totalDevengado)]}
            />
          )}

          {deducciones.length > 0 && (
            <DetalleSection
              title="Deducciones"
              columns={['Concepto', '', '', 'Valor']}
              rows={deducciones.map(r => ({ a: r.concepto, d: `− ${formatCOP(parseFloat(r.valor))}` }))}
              total={['Total deducciones', `− ${formatCOP(totalDeducciones)}`]}
            />
          )}

          {aportes.length > 0 && (
            <DetalleSection
              title="Aportes empleador (informativos)"
              columns={['Concepto', '', '', 'Valor']}
              rows={aportes.map(r => ({ a: r.concepto, d: formatCOP(parseFloat(r.valor)) }))}
              muted
            />
          )}

        </div>

        <div style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
          <Card>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em' }}>Neto a pagar</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1A3A5C', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
              {formatCOP(neto)}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
              {empNombreNav || `Empleado #${nomina.empleado_id}`}
            </div>
            <div style={{ height: 1, background: '#E5E7EB', margin: '16px 0' }} />
            <SummaryLine label="Devengado" value={formatCOP(totalDevengado)} />
            <SummaryLine label="Deducciones" value={`− ${formatCOP(totalDeducciones)}`} negative />
            <SummaryLine label="Neto" value={formatCOP(neto)} bold />
            <div style={{ height: 1, background: '#E5E7EB', margin: '16px 0' }} />
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
              Liquidación según Código Sustantivo del Trabajo de Colombia.
              Auxilio de transporte aplicado: salario ≤ 2 × SMMLV.
              Sin retención en la fuente.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
