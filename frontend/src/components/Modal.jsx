import Icon from './Icon';

const WIDTHS = { sm: 420, md: 560, lg: 720 };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,24,39,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 8,
          width: WIDTHS[size], maxWidth: '92vw',
          boxShadow: '0 10px 15px -3px rgba(17,24,39,.1), 0 4px 6px -4px rgba(17,24,39,.08)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4, borderRadius: 4 }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
