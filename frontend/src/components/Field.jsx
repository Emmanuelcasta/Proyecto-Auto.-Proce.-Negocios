export default function Field({ label, hint, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{label}</label>}
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: '#6B7280' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: '#991B1B' }}>{error}</span>}
    </div>
  );
}
