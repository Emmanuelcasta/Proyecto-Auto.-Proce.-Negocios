import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { TurnoPill } from '../components/Badge';
import { fakeCiclo } from '../lib/fakeData';

export default function TurnosScreen() {
  return (
    <div>
      <PageHeader
        title="Turnos"
        subtitle="Ciclo de rotación · 6 semanas · inicia el 06 de abril de 2026"
        actions={<Button variant="secondary" icon="settings">Configurar ciclo</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#111827' }}>
            Turno 1 — 6:00am a 2:00pm
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
            L-V: 8h brutas, 7h20min efectivos · Sábado: 6:00am a 12:00m, 5h40min efectivos.
            Sin recargo nocturno. 2 operarios.
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#111827' }}>
            Turno 2 — 2:00pm a 10:00pm
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
            L-V: 8h brutas, 7h20min efectivos · Sábado: 12:00m a 6:00pm, 5h40min efectivos.
            Recargo nocturno +35% en tramo 7pm–10pm. 1 operario.
          </p>
        </Card>
      </div>

      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Ciclo de rotación</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
          <thead>
            <tr>
              {['Bloque', 'Carlos (A)', 'Laura (B)', 'Juan (C)'].map((h, i) => (
                <th key={i} style={{
                  textAlign: 'left', padding: '10px 16px',
                  background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
                  fontSize: 11, fontWeight: 600, color: '#6B7280',
                  textTransform: 'uppercase', letterSpacing: '.04em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fakeCiclo.map((c, i) => (
              <tr key={i} style={i === 0 ? { background: '#F9FAFB' } : {}}>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontWeight: 500, color: '#111827' }}>
                  {c.semana}
                  {i === 0 && (
                    <span style={{
                      marginLeft: 8, fontSize: 11, color: '#15314D',
                      background: '#E8F0F7', padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                    }}>ACTUAL</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}><TurnoPill turno={c.A} /></td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}><TurnoPill turno={c.B} /></td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}><TurnoPill turno={c.C} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
