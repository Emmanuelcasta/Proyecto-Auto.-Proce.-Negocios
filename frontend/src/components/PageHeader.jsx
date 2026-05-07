export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16, marginBottom: 24,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>
          {title}
        </h1>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}
