import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',   icon: 'dashboard',  path: '/dashboard', roles: ['ADMIN', 'CONTADOR'] },
  { key: 'empleados',   label: 'Empleados',   icon: 'users',      path: '/empleados', roles: ['ADMIN', 'CONTADOR'] },
  { key: 'turnos',      label: 'Turnos',      icon: 'calendar',   path: '/turnos',    roles: ['ADMIN', 'CONTADOR'] },
  { key: 'marcaciones', label: 'Marcaciones', icon: 'clock',      path: '/marcaciones', roles: ['ADMIN', 'CONTADOR'] },
  { key: 'nomina',      label: 'Nómina',      icon: 'file',       path: '/nomina',      roles: ['ADMIN', 'CONTADOR'] },
  { key: 'mi-nomina',   label: 'Mi Nómina',   icon: 'file',       path: '/mi-nomina',   roles: ['EMPLEADO', 'ADMIN'] },
  { key: 'reportes',    label: 'Reportes',    icon: 'chart',      path: '/reportes',    roles: ['ADMIN', 'CONTADOR'] },
];

export default function Sidebar({ onLogout, role }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => pathname.startsWith(path);

  const filteredItems = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside style={{
      width: 240, background: '#1A3A5C', color: '#fff',
      padding: '16px 12px', display: 'flex', flexDirection: 'column',
      gap: 2, height: '100%', flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 8px 16px', borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: 8,
      }}>
        <img src="/mark.svg" alt="" style={{ height: 32 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>SysClock</div>
          <div style={{ fontSize: 10, letterSpacing: '.08em', opacity: 0.7, textTransform: 'uppercase' }}>Nómina</div>
        </div>
      </div>

      {filteredItems.map(item => (
        <a
          key={item.key}
          onClick={() => navigate(item.path)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 6,
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,.78)',
            background: isActive(item.path) ? 'rgba(255,255,255,.1)' : 'transparent',
            textDecoration: 'none',
          }}
        >
          <Icon name={item.icon} size={18} />
          {item.label}
        </a>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em',
        color: 'rgba(255,255,255,.5)', padding: '14px 10px 6px', fontWeight: 600,
      }}>
        Cuenta
      </div>
      <a
        onClick={() => navigate('/configuracion')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', borderRadius: 6,
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
          color: 'rgba(255,255,255,.78)', textDecoration: 'none',
        }}
      >
        <Icon name="settings" size={18} />Configuración
      </a>
      <a
        onClick={onLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', borderRadius: 6,
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
          color: 'rgba(255,255,255,.78)', textDecoration: 'none',
        }}
      >
        <Icon name="logout" size={18} />Cerrar sesión
      </a>
    </aside>
  );
}
