import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { fakeLiquidacion } from '../lib/fakeData';
import { formatCOP, formatHrs } from '../lib/formatters';

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
  const nomina = state?.nomina || { id: 101, estado: 'BORRADOR' };
  const [estado, setEstado] = useState(nomina.estado);
  const d = fakeLiquidacion;

  const totalDevengado = d.devengados.reduce((s, x) => s + x.valor, 0);
  const totalDeducciones = d.deducciones.reduce((s, x) => s + x.valor, 0);
  const neto = totalDevengado - totalDeducciones;

  return (
    <div>
      <Button variant="link" onClick={() => navigate('/nomina')} style={{ marginBottom: 12 }}>← Volver a Nómina</Button>
      <PageHeader
        title={`Liquidación · ${d.empleado}`}
        subtitle={`${d.periodo} · ${d.cargo}`}
        actions={
          <>
            <Button variant="secondary" icon="download">Descargar comprobante</Button>
            {estado === 'BORRADOR' && (
              <Button icon="check" onClick={() => setEstado('APROBADO')}>Aprobar</Button>
            )}
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <MiniStat label="Días hábiles" value={`${d.diasHabiles} / ${d.diasMes}`} />
        <MiniStat label="Umbral horas" value={formatHrs(d.umbral)} />
        <MiniStat label="Valor hora" value={formatCOP(d.valorHora)} />
        <MiniStat label="Estado" value={<Badge status={estado}>{estado.charAt(0) + estado.slice(1).toLowerCase()}</Badge>} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DetalleSection
            title="Detalle de horas"
            columns={['Concepto', 'Horas', 'Recargo', 'Valor']}
            rows={d.horas.filter(r => r.horas > 0 || r.factor === 0).map(r => ({
              a: r.concepto,
              b: formatHrs(r.horas),
              c: r.factor ? `+${(r.factor * 100).toFixed(0)}%` : '—',
              d: formatCOP(r.valor),
            }))}
          />
          <DetalleSection
            title="Devengados"
            columns={['Concepto', '', '', 'Valor']}
            rows={d.devengados.map(r => ({ a: r.concepto, d: formatCOP(r.valor) }))}
            total={['Total devengado', formatCOP(totalDevengado)]}
          />
          <DetalleSection
            title="Deducciones"
            columns={['Concepto', '', '', 'Valor']}
            rows={d.deducciones.map(r => ({ a: r.concepto, d: `− ${formatCOP(r.valor)}` }))}
            total={['Total deducciones', `− ${formatCOP(totalDeducciones)}`]}
          />
          <DetalleSection
            title="Aportes empleador (informativos)"
            columns={['Concepto', '', '', 'Valor']}
            rows={d.aportes.map(r => ({ a: r.concepto, d: formatCOP(r.valor) }))}
            muted
          />
        </div>

        <div style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
          <Card>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em' }}>Neto a pagar</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1A3A5C', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
              {formatCOP(neto)}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{d.empleado} · CC {d.cedula}</div>
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
