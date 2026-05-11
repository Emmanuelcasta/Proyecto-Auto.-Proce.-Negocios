import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import Field from '../components/Field';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import { historialNomina, liquidarQuincena, getEmpleados } from '../lib/api';
import { formatCOP, formatHrs } from '../lib/formatters';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatPeriodo(inicio, fin) {
  const [dy, dm, dd] = inicio.split('-');
  const [hy, hm, hd] = fin.split('-');
  const ini = `${parseInt(dd)} ${MESES[parseInt(dm)-1]} ${dy}`;
  const hst = `${parseInt(hd)} ${MESES[parseInt(hm)-1]} ${hy}`;
  return `${ini} – ${hst}`;
}

export default function NominaListScreen() {
  const navigate = useNavigate();
  const [nominas, setNominas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoMap, setEmpleadoMap] = useState({});
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [liqEmpId, setLiqEmpId] = useState('');
  const [liqInicio, setLiqInicio] = useState('');
  const [liqFin, setLiqFin] = useState('');
  const [liquidando, setLiquidando] = useState(false);
  const userRole = localStorage.getItem('user_role');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [n, e] = await Promise.all([
        historialNomina(),
        getEmpleados({ limit: 500 }),
      ]);
      const list = n?.nominas || [];
      setNominas(list);
      const emps = e?.empleados || [];
      setEmpleados(emps.filter(x => x.activo));
      const map = {};
      emps.forEach(emp => { map[emp.id] = emp.nombre; });
      setEmpleadoMap(map);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = estadoFilter === 'todos'
    ? nominas
    : nominas.filter(n => n.estado === estadoFilter);

  async function handleLiquidar() {
    if (!liqEmpId || !liqInicio || !liqFin) return;
    setLiquidando(true);
    try {
      const nueva = await liquidarQuincena({
        empleado_id: parseInt(liqEmpId),
        fecha_inicio: liqInicio,
        fecha_fin: liqFin,
      });
      setShowModal(false);
      setLiqEmpId(''); setLiqInicio(''); setLiqFin('');
      await loadData();
      // Navegar al detalle recién creado
      const nombre = empleadoMap[parseInt(liqEmpId)] || `Empleado #${liqEmpId}`;
      navigate('/nomina/liquidacion', { state: { nominaId: nueva.id, empNombre: nombre } });
    } catch (e) {
      alert(e.message);
    } finally {
      setLiquidando(false);
    }
  }

  function openDetalle(n) {
    const nombre = empleadoMap[n.empleado_id] || `Empleado #${n.empleado_id}`;
    navigate('/nomina/liquidacion', { state: { nominaId: n.id, empNombre: nombre } });
  }

  return (
    <div>
      <PageHeader
        title="Nómina"
        subtitle="Liquidaciones quincenales · CST Colombia 2026"
        actions={
          (userRole === 'ADMIN' || userRole === 'CONTADOR') && (
            <Button icon="plus" onClick={() => setShowModal(true)}>Liquidar quincena</Button>
          )
        }
      />

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12 }}>
          <div style={{ flex: '0 0 200px' }}>
            <Select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="APROBADO">Aprobado</option>
              <option value="PAGADO">Pagado</option>
            </Select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '16px 24px', color: '#991B1B', fontSize: 14 }}>
            Error al cargar nóminas: {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            Cargando historial de nómina…
          </div>
        ) : (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#6B7280' }}>
                      No hay nóminas registradas.
                    </td>
                  </tr>
                ) : filtered.map(n => {
                  const nombre = empleadoMap[n.empleado_id] || `Empleado #${n.empleado_id}`;
                  return (
                    <tr
                      key={n.id}
                      onClick={() => openDetalle(n)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={nombre} />
                          <span style={{ color: '#111827', fontWeight: 500 }}>{nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151' }}>
                        {formatPeriodo(n.fecha_inicio, n.fecha_fin)}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {n.dias_habiles_quincena}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatHrs(parseFloat(n.total_horas_trabajadas))}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCOP(parseFloat(n.total_devengado))}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCOP(parseFloat(n.total_deducciones))}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCOP(parseFloat(n.neto_pagar))}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        <Badge status={n.estado}>{n.estado.charAt(0) + n.estado.slice(1).toLowerCase()}</Badge>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#9CA3AF' }}>
                        <Icon name="chevRight" size={16} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal liquidar quincena */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Liquidar quincena"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button
              onClick={handleLiquidar}
              disabled={liquidando || !liqEmpId || !liqInicio || !liqFin}
            >
              {liquidando ? 'Liquidando…' : 'Liquidar'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Empleado">
            <Select value={liqEmpId} onChange={e => setLiqEmpId(e.target.value)}>
              <option value="">Seleccionar empleado…</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha inicio">
              <Input type="date" value={liqInicio} onChange={e => setLiqInicio(e.target.value)} />
            </Field>
            <Field label="Fecha fin">
              <Input type="date" value={liqFin} onChange={e => setLiqFin(e.target.value)} />
            </Field>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            Se generará una liquidación en estado <strong>Borrador</strong> calculada automáticamente desde las marcaciones del periodo.
          </p>
        </div>
      </Modal>
    </div>
  );
}
