import Card from './Card';
import Icon from './Icon';

const DELTA_COLORS = {
  neutral:  '#6B7280',
  positive: '#065F46',
  warning:  '#92400E',
  negative: '#991B1B',
};

export default function KpiCard({ icon, label, value, delta, deltaTone = 'neutral' }) {
  return (
    <Card padding={20}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600, color: '#6B7280',
        textTransform: 'uppercase', letterSpacing: '.04em',
      }}>
        <Icon name={icon} size={14} />{label}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700, color: '#111827',
        letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 4,
      }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 12, marginTop: 2, color: DELTA_COLORS[deltaTone], fontVariantNumeric: 'tabular-nums' }}>
          {delta}
        </div>
      )}
    </Card>
  );
}
