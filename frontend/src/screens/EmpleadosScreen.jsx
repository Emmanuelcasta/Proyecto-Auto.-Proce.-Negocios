import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Avatar from '../components/Avatar';
import Badge, { TurnoPill } from '../components/Badge';
import Modal from '../components/Modal';
import Field from '../components/Field';
import EmptyState from '../components/EmptyState';
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from '../lib/api';
import { formatCOP } from '../lib/formatters';

const EMPTY_FORM = { nombre: '', documento: '', salario: '' };

export default function EmpleadosScreen() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await getEmpleados({ limite: 100 });
      setEmpleados(data?.empleados || data || []);
    } catch {
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = empleados.filter(e =>
    !search || e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    e.numero_documento?.includes(search)
  );

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(emp) {
    setEditing(emp);
    setForm({
      nombre: emp.nombre || '',
      documento: emp.documento || '',
      salario: String(emp.salario || ''),
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    setSaving(true);
    try {
      const payload = { nombre: form.nombre, documento: form.documento, salario: Number(form.salario) };
      if (editing) {
        await updateEmpleado(editing.id, payload);
      } else {
        await createEmpleado(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(emp) {
    if (!confirm(`¿Eliminar a ${emp.nombre}?`)) return;
    try {
      await deleteEmpleado(emp.id);
      await load();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  }

  function setField(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  return (
    <div>
      <PageHeader
        title="Empleados"
        subtitle={`${empleados.length} empleado${empleados.length !== 1 ? 's' : ''} activos`}
        actions={<Button icon="plus" onClick={openNew}>Nuevo empleado</Button>}
      />

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12 }}>
          <div style={{ flex: '0 0 280px' }}>
            <Input icon="search" placeholder="Buscar por nombre o cédula…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Cargando…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="users" title="Sin empleados" description="Crea el primer empleado para comenzar." action={<Button onClick={openNew} icon="plus">Nuevo empleado</Button>} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
            <thead>
              <tr>
                {['Empleado', 'Documento', 'Salario', 'Estado', ''].map((h, i) => (
                  <th key={i} style={{
                    textAlign: i === 3 ? 'right' : 'left',
                    padding: '10px 16px', background: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: 11, fontWeight: 600, color: '#6B7280',
                    textTransform: 'uppercase', letterSpacing: '.04em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} style={{ cursor: 'default' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={ev => ev.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={e.nombre} />
                      <div>
                        <div style={{ color: '#111827', fontWeight: 500 }}>{e.nombre}</div>
                        {e.email && <div style={{ color: '#6B7280', fontSize: 12 }}>{e.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{e.documento || '—'}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {formatCOP(e.salario)}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <Badge status="ACTIVO" withDot>Activo</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="ghost" icon="edit" onClick={() => openEdit(e)}>Editar</Button>
                      <Button size="sm" variant="ghost" icon="trash" onClick={() => handleDelete(e)} style={{ color: '#DC2626' }}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar empleado' : 'Nuevo empleado'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nombre || !form.numero_documento}>
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear empleado'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#991B1B' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Nombre completo">
              <Input value={form.nombre} onChange={setField('nombre')} placeholder="Carlos Ramírez" />
            </Field>
            <Field label="Número de documento">
              <Input value={form.documento} onChange={setField('documento')} placeholder="79412601" />
            </Field>
          </div>
          <Field label="Salario mensual (COP)">
            <Input type="number" value={form.salario} onChange={setField('salario')} placeholder="1423500" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
