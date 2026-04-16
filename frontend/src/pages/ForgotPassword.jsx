import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { forgotPassword } from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el email. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>✉️</div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: theme.text,
              letterSpacing: '-0.03em',
              margin: '0 0 12px',
            }}
          >
            Email enviado
          </h2>
          <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 8px' }}>
            Si existe una cuenta con el email{' '}
            <strong style={{ color: theme.text }}>{email}</strong>, recibirás un
            enlace para recuperar tu contraseña.
          </p>
          <p style={{ fontSize: '12.5px', color: theme.textMuted, margin: '0 0 28px' }}>
            ¿No llegó? Revisá la carpeta de spam o intentá con otro email.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '11px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: theme.textSecondary,
            textDecoration: 'none',
            marginBottom: '24px',
            fontWeight: 500,
          }}
        >
          ← Volver al inicio de sesión
        </Link>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: theme.text,
            letterSpacing: '-0.03em',
            margin: '0 0 6px',
          }}
        >
          Recuperar contraseña
        </h2>
        <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 28px', lineHeight: 1.5 }}>
          Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: theme.textSecondary,
                marginBottom: '6px',
                letterSpacing: '0.01em',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@godoycruz.gob.ar"
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: `1.5px solid ${theme.inputBorder}`,
                background: theme.inputBg,
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = theme.inputFocus)}
              onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '9px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: loading ? theme.textMuted : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
