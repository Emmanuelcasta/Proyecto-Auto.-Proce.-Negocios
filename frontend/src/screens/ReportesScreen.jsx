import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { downloadPila, getResumenMes, getHorasExtra } from '../lib/api';

function ReporteCard({ icon, title, desc, cta, onClick, loading }) {
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
      <Button variant="secondary" size="sm" icon="download" onClick={onClick} disabled={loading}>
        {loading ? 'Generando...' : cta}
      </Button>
    </Card>
  );
}

export default function ReportesScreen() {
  const [loadingPila, setLoadingPila] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Helper to get current period as YYYY-MM
  const getCurrentPeriod = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleDescargarPila = async () => {
    try {
      setLoadingPila(true);
      const periodo = window.prompt("Ingrese el periodo a exportar (YYYY-MM):", getCurrentPeriod());
      if (!periodo) return;
      await downloadPila(periodo);
      alert("Planilla PILA descargada correctamente.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoadingPila(false);
    }
  };

  const handleResumenMes = async () => {
    try {
      setLoadingResumen(true);
      const d = new Date();
      const res = await getResumenMes(d.getFullYear(), d.getMonth() + 1);
      alert(`Resumen del mes:\n\nNóminas: ${res.nominas_liquidadas}\nTotal Devengado: $${res.total_devengado}\nTotal Deducciones: $${res.total_deducciones}\nTotal Neto: $${res.total_neto_pagar}`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoadingResumen(false);
    }
  };

  const handleHorasExtra = async () => {
    try {
      setLoadingExtra(true);
      const d = new Date();
      const firstDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-28`; // Simple approach
      const res = await getHorasExtra(firstDay, lastDay);
      if (res.length === 0) {
        alert("No hay horas extra en este periodo.");
        return;
      }
      alert(`Se encontraron ${res.length} registros de horas extra. (Ver consola para detalle)`);
      console.log("Horas Extra:", res);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoadingExtra(false);
    }
  };

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Exportaciones y resúmenes para PILA y contabilidad" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <ReporteCard
          icon="file"
          title="Planilla PILA"
          desc="Aportes a seguridad social del periodo en formato .xlsx oficial."
          cta="Generar PILA"
          onClick={handleDescargarPila}
          loading={loadingPila}
        />
        <ReporteCard
          icon="clock"
          title="Horas extra"
          desc="Detalle de recargos nocturnos, extras y festivos por empleado."
          cta="Generar reporte"
          onClick={handleHorasExtra}
          loading={loadingExtra}
        />
        <ReporteCard
          icon="dollar"
          title="Resumen del mes"
          desc="Devengados, deducciones y neto pagado consolidado del mes."
          cta="Generar resumen"
          onClick={handleResumenMes}
          loading={loadingResumen}
        />
      </div>
    </div>
  );
}

