import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

function ReporteCard({ icon, title, desc, cta }) {
  return (
    <Card>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: '#E8F0F7', color: '#1A3A5C',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
      }}>
        <Icon name={icon} size={18} />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#111827' }}>{title}</h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{desc}</p>
      <Button variant="secondary" size="sm" icon="download">{cta}</Button>
    </Card>
  );
}

export default function ReportesScreen() {
  return (
    <div>
      <PageHeader title="Reportes" subtitle="Exportaciones y resúmenes para PILA y contabilidad" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <ReporteCard
          icon="file"
          title="Planilla PILA"
          desc="Aportes a seguridad social del periodo en formato .xlsx oficial."
          cta="Generar PILA"
        />
        <ReporteCard
          icon="clock"
          title="Horas extra"
          desc="Detalle de recargos nocturnos, extras y festivos por empleado."
          cta="Generar reporte"
        />
        <ReporteCard
          icon="dollar"
          title="Resumen del mes"
          desc="Devengados, deducciones y neto pagado consolidado del mes."
          cta="Generar resumen"
        />
      </div>
    </div>
  );
}
