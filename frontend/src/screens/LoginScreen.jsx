import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Field from '../components/Field';
import Input from '../components/Input';
import Button from '../components/Button';
import { login } from '../lib/api';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setPwd_email] = useState('admin@sysclock.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F7F8FA', padding: 24,
    }}>
      <Card padding={32} style={{ width: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <img src="/logo.svg" alt="SysClock Nómina" style={{ height: 48 }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, textAlign: 'center', color: '#111827' }}>
          Iniciar sesión
        </h1>
        <p style={{ margin: '6px 0 24px', fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
          Sistema de automatización de nómina
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Correo electrónico">
            <Input
              type="email"
              value={email}
              onChange={e => setPwd_email(e.target.value)}
              icon="user"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Contraseña" error={error || undefined}>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={!!error}
              required
              autoComplete="current-password"
            />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Mantener sesión iniciada
            </label>
            <a href="#" style={{ color: '#1A3A5C', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar'}
          </Button>
        </form>

        <p style={{ marginTop: 24, marginBottom: 0, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
          Acceso restringido al personal autorizado · CST Colombia 2026
        </p>
      </Card>
    </div>
  );
}
