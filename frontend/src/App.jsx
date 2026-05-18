import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import EmpleadosScreen from './screens/EmpleadosScreen';
import TurnosScreen from './screens/TurnosScreen';
import MarcacionesScreen from './screens/MarcacionesScreen';
import NominaListScreen from './screens/NominaListScreen';
import LiquidacionScreen from './screens/LiquidacionScreen';
import ReportesScreen from './screens/ReportesScreen';
import MiNominaScreen from './screens/MiNominaScreen';
import ConfiguracionScreen from './screens/ConfiguracionScreen';
import { logout } from './lib/api';

function RequireAuth() {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppLayout() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('user_email') || 'Admin';
  const userRole = localStorage.getItem('user_role') || 'ADMIN';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar onLogout={handleLogout} role={userRole} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F7F8FA', overflow: 'hidden' }}>
        <Topbar user={userEmail} role={userRole} />
        <div style={{
          flex: 1, overflowY: 'auto', padding: 32,
          maxWidth: 1400, width: '100%', margin: '0 auto', boxSizing: 'border-box',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"    element={<DashboardScreen />} />
            <Route path="/empleados"    element={<EmpleadosScreen />} />
            <Route path="/turnos"       element={<TurnosScreen />} />
            <Route path="/marcaciones"  element={<MarcacionesScreen />} />
            <Route path="/nomina"       element={<NominaListScreen />} />
            <Route path="/nomina/liquidacion" element={<LiquidacionScreen />} />
            <Route path="/reportes"     element={<ReportesScreen />} />
            <Route path="/mi-nomina"    element={<MiNominaScreen />} />
            <Route path="/configuracion" element={<ConfiguracionScreen />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
