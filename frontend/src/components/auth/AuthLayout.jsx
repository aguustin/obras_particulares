import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import DocumentosAcceso from './DocumentosAcceso';

export default function AuthLayout({ children }) {
  const { theme, isDark, toggle } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.mainBg,
      }}
    >
      {/* Panel izquierdo — branding */}
      <div
        style={{
          display: 'none',
          flex: '0 0 420px',
          background: 'linear-gradient(160deg, #5b21b6 0%, #4f46e5 60%, #7c3aed 100%)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-left-panel"
      >
        {/* Círculos decorativos */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '20px',
              backdropFilter: 'blur(4px)',
            }}
          >
            🏗️
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              margin: '0 0 8px',
            }}
          >
            Godoy Cruz
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Sistema de Obras Particulares
          </p>
        </div>

        {/* Texto central */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
            }}
          >
            Gestión de planos municipales
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
            Seguimiento de expedientes, estados y versiones de planos para el municipio de Godoy Cruz.
          </p>
        </div>

        {/* Footer */}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 1, margin: 0 }}>
          Municipalidad de Godoy Cruz · Mendoza
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          position: 'relative',
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: theme.contentBg,
            border: `1px solid ${theme.border}`,
            cursor: 'pointer',
            fontSize: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadow,
            zIndex: 10,
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Logo visible solo en mobile (cuando el panel izq. está oculto) */}
          <div
            className="auth-mobile-logo"
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
              }}
            >
              🏗️
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
              Godoy Cruz
            </h1>
            <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>
              Obras Particulares
            </p>
          </div>

          {children}
          <DocumentosAcceso />
        </div>
      </div>

      <style>{`
        @media (min-width: 820px) {
          .auth-left-panel { display: flex !important; }
          .auth-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
