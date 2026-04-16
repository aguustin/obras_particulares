import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { registerSelf } from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';

export default function Register() {
  const { theme } = useTheme();

  const [esTecnico, setEsTecnico] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    nombre: '', apellido: '', dni: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ingresá un email válido';
    if (!form.password) errs.password = 'La contraseña es requerida';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!form.confirmPassword) errs.confirmPassword = 'Repetí la contraseña';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    if (esTecnico) {
      if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
      if (!form.apellido.trim()) errs.apellido = 'El apellido es requerido';
      if (!form.dni.trim()) errs.dni = 'El DNI es requerido';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await registerSelf(form.email, form.password, esTecnico, form.nombre, form.apellido, form.dni);
      setSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al registrarse. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: theme.textSecondary, marginBottom: '6px', letterSpacing: '0.01em',
  };
  const fieldErr = { fontSize: '12px', color: '#ef4444', marginTop: '5px' };

  // ─── Pantalla de éxito ────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>{esTecnico ? '⏳' : '📬'}</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            {esTecnico ? '¡Solicitud enviada!' : '¡Revisá tu email!'}
          </h2>
          <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 24px' }}>
            {esTecnico
              ? 'Tu solicitud fue enviada al administrador. Recibirás un email cuando sea revisada.'
              : <>Te enviamos un enlace de verificación a <strong style={{ color: theme.text }}>{form.email}</strong>. Tocá el enlace para activar tu cuenta.</>}
          </p>
          {!esTecnico && (
            <p style={{ fontSize: '12.5px', color: theme.textMuted, margin: '0 0 28px' }}>
              ¿No llegó? Revisá la carpeta de spam.
            </p>
          )}
          <Link
            to="/login"
            style={{
              display: 'inline-block', padding: '11px 28px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            }}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ─── Formulario ───────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
          Crear cuenta
        </h2>
        <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 20px' }}>
          Completá los datos para registrarte
        </p>

        {/* Toggle Soy técnico */}
        <button
          type="button"
          onClick={() => { setEsTecnico((v) => !v); setErrors({}); }}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: '10px',
            border: `1.5px solid ${esTecnico ? theme.accent : theme.border}`,
            background: esTecnico ? theme.accentLight : theme.contentBg,
            color: esTecnico ? theme.accent : theme.textSecondary,
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: '16px' }}>{esTecnico ? '✅' : '🔧'}</span>
          {esTecnico ? 'Registrándome como técnico' : 'Soy técnico'}
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>

          {/* Campos extra para técnico */}
          {esTecnico && (
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: theme.accentLight,
                border: `1.5px solid ${theme.borderHover}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Datos del técnico
              </p>

              {/* Nombre + Apellido en fila */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setField('nombre', e.target.value)}
                    placeholder="Juan"
                    style={inputStyle(!!errors.nombre)}
                    onFocus={(e) => !errors.nombre && (e.target.style.borderColor = theme.inputFocus)}
                    onBlur={(e) => !errors.nombre && (e.target.style.borderColor = theme.inputBorder)}
                  />
                  {errors.nombre && <p style={fieldErr}>{errors.nombre}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => setField('apellido', e.target.value)}
                    placeholder="García"
                    style={inputStyle(!!errors.apellido)}
                    onFocus={(e) => !errors.apellido && (e.target.style.borderColor = theme.inputFocus)}
                    onBlur={(e) => !errors.apellido && (e.target.style.borderColor = theme.inputBorder)}
                  />
                  {errors.apellido && <p style={fieldErr}>{errors.apellido}</p>}
                </div>
              </div>

              {/* DNI */}
              <div>
                <label style={labelStyle}>DNI</label>
                <input
                  type="text"
                  value={form.dni}
                  onChange={(e) => setField('dni', e.target.value)}
                  placeholder="12345678"
                  style={inputStyle(!!errors.dni)}
                  onFocus={(e) => !errors.dni && (e.target.style.borderColor = theme.inputFocus)}
                  onBlur={(e) => !errors.dni && (e.target.style.borderColor = theme.inputBorder)}
                />
                {errors.dni && <p style={fieldErr}>{errors.dni}</p>}
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="usuario@godoycruz.gob.ar"
              autoComplete="email"
              style={inputStyle(!!errors.email)}
              onFocus={(e) => !errors.email && (e.target.style.borderColor = theme.inputFocus)}
              onBlur={(e) => !errors.email && (e.target.style.borderColor = theme.inputBorder)}
            />
            {errors.email && <p style={fieldErr}>{errors.email}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <label style={labelStyle}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                style={{ ...inputStyle(!!errors.password), paddingRight: '44px' }}
                onFocus={(e) => !errors.password && (e.target.style.borderColor = theme.inputFocus)}
                onBlur={(e) => !errors.password && (e.target.style.borderColor = theme.inputBorder)}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: theme.textMuted, padding: '2px', lineHeight: 1 }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p style={fieldErr}>{errors.password}</p>}
          </div>

          {/* Repetir contraseña */}
          <div>
            <label style={labelStyle}>Repetir contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
                style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: '44px' }}
                onFocus={(e) => !errors.confirmPassword && (e.target.style.borderColor = theme.inputFocus)}
                onBlur={(e) => !errors.confirmPassword && (e.target.style.borderColor = theme.inputBorder)}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: theme.textMuted, padding: '2px', lineHeight: 1 }}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <p style={fieldErr}>{errors.confirmPassword}</p>}
          </div>

          {serverError && (
            <div style={{ padding: '10px 14px', borderRadius: '9px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: loading ? theme.textMuted : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff', fontSize: '14px', fontWeight: 600, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.01em',
              opacity: loading ? 0.7 : 1, marginTop: '4px',
            }}
          >
            {loading ? 'Registrando...' : esTecnico ? 'Enviar solicitud' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: theme.textSecondary }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
