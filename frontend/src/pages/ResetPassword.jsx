import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { resetPassword } from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';

export default function ResetPassword() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.password) {
      errs.password = 'La contraseña es requerida';
    } else if (form.password.length < 6) {
      errs.password = 'Mínimo 6 caracteres';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Repetí la contraseña';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Las contraseñas no coinciden';
    }
    return errs;
  };

  if (!token) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>🔗</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            Enlace inválido
          </h2>
          <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 24px' }}>
            Este enlace no es válido. Solicitá uno nuevo desde la pantalla de recuperación de contraseña.
          </p>
          <Link
            to="/forgot-password"
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
            Recuperar contraseña
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setSuccess(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'El enlace expiró o no es válido. Solicitá uno nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>🔓</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            ¡Contraseña actualizada!
          </h2>
          <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 28px' }}>
            Tu contraseña fue restablecida correctamente. Ya podés iniciar sesión con tu nueva contraseña.
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
            Iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? '#f87171' : theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.text,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: theme.textSecondary,
    marginBottom: '6px',
    letterSpacing: '0.01em',
  };

  return (
    <AuthLayout>
      <div>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: theme.text,
            letterSpacing: '-0.03em',
            margin: '0 0 6px',
          }}
        >
          Nueva contraseña
        </h2>
        <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 28px' }}>
          Ingresá tu nueva contraseña para restablecer el acceso.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
          {/* Nueva contraseña */}
          <div>
            <label style={labelStyle}>Nueva contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                style={{ ...inputStyle(!!errors.password), paddingRight: '44px' }}
                onFocus={(e) => !errors.password && (e.target.style.borderColor = theme.inputFocus)}
                onBlur={(e) => !errors.password && (e.target.style.borderColor = theme.inputBorder)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: theme.textMuted,
                  padding: '2px',
                  lineHeight: 1,
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.password}</p>
            )}
          </div>

          {/* Repetir contraseña */}
          <div>
            <label style={labelStyle}>Repetir contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
                style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: '44px' }}
                onFocus={(e) => !errors.confirmPassword && (e.target.style.borderColor = theme.inputFocus)}
                onBlur={(e) => !errors.confirmPassword && (e.target.style.borderColor = theme.inputBorder)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: theme.textMuted,
                  padding: '2px',
                  lineHeight: 1,
                }}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.confirmPassword}</p>
            )}
          </div>

          {serverError && (
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
              {serverError}{' '}
              <Link to="/forgot-password" style={{ color: '#7c3aed', fontWeight: 600 }}>
                Solicitá un nuevo enlace
              </Link>
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
              marginTop: '4px',
            }}
          >
            {loading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: theme.textSecondary }}>
          <Link to="/login" style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
