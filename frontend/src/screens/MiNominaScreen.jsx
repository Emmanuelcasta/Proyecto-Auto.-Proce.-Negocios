import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { getMiNomina } from '../lib/api';
import { formatCOP } from '../lib/formatters';

export default function MiNominaScreen() {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getMiNomina();
      setNominas(data.nominas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAGADO': return 'success';
      case 'APROBADO': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div>
      <PageHeader 
        title="Mi Nómina" 
        subtitle="Consulta tus quincenas liquidadas y descarga tus comprobantes" 
      />

      <Card padding={0}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Cargando tus datos...</div>
        ) : nominas.length === 0 ? (
          <EmptyState 
            icon="file" 
            title="No hay nóminas registradas" 
            desc="Cuando se liquide tu primera quincena aparecerá aquí." 
          />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={thStyle}>Periodo</th>
                <th style={thStyle}>Días</th>
                <th style={thStyle}>Neto a Pagar</th>
                <th style={thStyle}>Estado</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {nominas.map(n => (
                <tr key={n.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {n.fecha_inicio} al {n.fecha_fin}
                    </div>
                  </td>
                  <td style={tdStyle}>{n.dias_habiles_quincena} días</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      {formatCOP(n.neto_pagar)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={getStatusColor(n.estado)}>{n.estado}</Badge>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon="download"
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL || ''}/api/v1/nomina/${n.id}/comprobante`, '_blank')}
                    >
                      Comprobante
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 20px',
  fontSize: 12,
  fontWeight: 600,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '16px 20px',
  fontSize: 14,
  color: '#374151',
};
