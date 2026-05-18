import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Field from '../components/Field';
import { getConfiguracion, updateConfiguracion } from '../lib/api';

export default function ConfiguracionScreen() {
  const [smmlv, setSmmlv] = useState('');
  const [auxTransporte, setAuxTransporte] = useState('');
  const [festivos, setFestivos] = useState([]);
  const [newFestivo, setNewFestivo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getConfiguracion();
      setSmmlv(data.smmlv ? String(Math.round(Number(data.smmlv))) : '1423500');
      setAuxTransporte(data.auxilio_transporte ? String(Math.round(Number(data.auxilio_transporte))) : '200000');
      setFestivos(data.festivos || []);
    } catch (err) {
      setError(err.message || 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        smmlv: Number(smmlv),
        auxilio_transporte: Number(auxTransporte),
        festivos: festivos,
      };
      await updateConfiguracion(payload);
      setSuccess('Configuración guardada correctamente.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  function handleAddFestivo() {
    if (!newFestivo) return;
    if (festivos.includes(newFestivo)) {
      setError('Esa fecha ya está registrada como festivo.');
      return;
    }
    setFestivos([...festivos, newFestivo].sort());
    setNewFestivo('');
  }

  function handleRemoveFestivo(date) {
    setFestivos(festivos.filter(f => f !== date));
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Parámetros globales de la liquidación de nómina (CST Colombia)"
      />

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, fontSize: 14, color: '#991B1B', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '12px 16px', background: '#D1FAE5', borderRadius: 8, fontSize: 14, color: '#065F46', marginBottom: 20 }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Cargando parámetros globales…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#111827' }}>Valores Legales (Mensuales)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Salario Mínimo Mensual (SMMLV)">
                <Input
                  type="number"
                  value={smmlv}
                  onChange={e => setSmmlv(e.target.value)}
                  placeholder="1423500"
                />
              </Field>
              <Field label="Auxilio de Transporte Legal">
                <Input
                  type="number"
                  value={auxTransporte}
                  onChange={e => setAuxTransporte(e.target.value)}
                  placeholder="200000"
                />
              </Field>
              <div style={{ marginTop: 8 }}>
                <Button onClick={handleSave} disabled={saving || !smmlv || !auxTransporte}>
                  {saving ? 'Guardando…' : 'Guardar Parámetros'}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#111827' }}>Calendario de Festivos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Field label="Agregar nuevo día festivo">
                    <Input
                      type="date"
                      value={newFestivo}
                      onChange={e => setNewFestivo(e.target.value)}
                    />
                  </Field>
                </div>
                <Button onClick={handleAddFestivo} variant="secondary">Agregar</Button>
              </div>

              <div style={{
                maxHeight: 250,
                overflowY: 'auto',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '8px 12px',
                background: '#F9FAFB'
              }}>
                {festivos.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                    No hay festivos registrados.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {festivos.map(f => (
                      <div key={f} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#fff',
                        borderRadius: 6,
                        border: '1px solid #F3F4F6',
                        fontSize: 13
                      }}>
                        <span style={{ color: '#374151', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{f}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFestivo(f)}
                          style={{ color: '#DC2626', padding: '2px 6px' }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar Calendario'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
