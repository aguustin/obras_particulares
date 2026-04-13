import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/common/Button';

export default function Login() {
  const { theme, isDark, toggle } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.text,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.mainBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: theme.contentBg,
          border: `1px solid ${theme.border}`,
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadow,
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: theme.contentBg,
          borderRadius: '20px',
          padding: '40px',
          boxShadow: theme.shadowLg,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, #7c3aed, #4f46e5)`,
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🏗️
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: theme.text }}>Godoy Cruz</h1>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '4px' }}>
            Obras Particulares
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.textSecondary, marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="usuario@godoycruz.gob.ar"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = theme.inputFocus)}
              onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.textSecondary, marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = theme.inputFocus)}
              onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg">
            Iniciar sesión
          </Button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: theme.textMuted }}>
          Sistema de gestión de planos municipales
        </p>
      </div>
    </div>
  );
}
