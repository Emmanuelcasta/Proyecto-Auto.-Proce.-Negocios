const STATUS_STYLES = {
  completo:   { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  incompleto: { bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
  corregido:  { bg: '#EDE9FE', fg: '#5B21B6', dot: '#8B5CF6' },
  error:      { bg: '#FEE2E2', fg: '#991B1B', dot: '#DC2626' },
  BORRADOR:   { bg: '#F3F4F6', fg: '#374151', dot: '#6B7280' },
  APROBADO:   { bg: '#E8F0F7', fg: '#15314D', dot: '#1A3A5C' },
  PAGADO:     { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  ACTIVO:     { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
};

export default function Badge({ status, children, withDot = true }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.BORRADOR;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 12, fontWeight: 500,
      background: s.bg, color: s.fg,
    }}>
      {withDot && <span style={{ width: 6, height: 6, borderRadius: 99, background: s.dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

export function TurnoPill({ turno }) {
  const isT2 = turno === 'TURNO_2';
  return (
    <span style={{
      display: 'inline-flex', padding: '3px 10px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: '.02em',
      background: isT2 ? '#1A3A5C' : '#E8F0F7',
      color: isT2 ? '#fff' : '#15314D',
    }}>
      {isT2 ? 'Turno 2' : 'Turno 1'}
    </span>
  );
}
