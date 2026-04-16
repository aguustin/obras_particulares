import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { verifyEmail } from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';
import Spinner from '../components/common/Spinner';

const REDIRECT_DELAY = 3; // segundos

export default function VerifyEmail() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación no es válido.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Cuenta verificada correctamente.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'El enlace de verificación es inválido o ya expiró.'
        );
      });
  }, [token]);

  // Cuenta regresiva y redirección automática al login tras verificación exitosa
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      navigate('/login');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  return (
    <AuthLayout>
      <div style={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Spinner size={40} />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: theme.text,
                letterSpacing: '-0.02em',
                margin: '0 0 8px',
              }}
            >
              Verificando tu cuenta...
            </h2>
            <p style={{ fontSize: '14px', color: theme.textSecondary }}>
              Por favor esperá un momento.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>✅</div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: theme.text,
                letterSpacing: '-0.03em',
                margin: '0 0 12px',
              }}
            >
              ¡Cuenta verificada!
            </h2>
            <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 8px' }}>
              {message} Ya podés iniciar sesión con tu cuenta.
            </p>
            <p style={{ fontSize: '13px', color: theme.textMuted, margin: '0 0 24px' }}>
              Redirigiendo en {countdown}...
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Ir al inicio de sesión ahora
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>❌</div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: theme.text,
                letterSpacing: '-0.03em',
                margin: '0 0 12px',
              }}
            >
              Enlace inválido
            </h2>
            <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 28px' }}>
              {message}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Link
                to="/register"
                style={{
                  display: 'inline-block',
                  padding: '12px 32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Registrarse nuevamente
              </Link>
              <Link
                to="/login"
                style={{ fontSize: '13.5px', color: theme.accent, fontWeight: 500, textDecoration: 'none' }}
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
