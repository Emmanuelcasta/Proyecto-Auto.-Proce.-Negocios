import Icon from './Icon';

export default function EmptyState({ icon = 'info', title, description, action }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 48, height: 48, borderRadius: 9999, background: '#F3F4F6', color: '#6B7280', marginBottom: 12,
      }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{title}</div>
      {description && <div style={{ fontSize: 13, marginTop: 4 }}>{description}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
