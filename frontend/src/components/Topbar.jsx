import Avatar from './Avatar';
import Icon from './Icon';

function todayStr() {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

export default function Topbar({ user = 'Admin', role = 'ADMIN' }) {
  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #E5E7EB',
      padding: '0 32px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6B7280', fontSize: 13 }}>
        <span>SysClock Nómina</span>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <span style={{ color: '#374151', fontWeight: 500 }}>{todayStr()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 8, borderRadius: 6 }}>
          <Icon name="bell" size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{user}</span>
            <span style={{ fontSize: 11, color: '#6B7280', letterSpacing: '.04em' }}>{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
