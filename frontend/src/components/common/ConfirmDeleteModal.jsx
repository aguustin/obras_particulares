import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Modal destructivo con confirmación por texto.
 * Props:
 *  - isOpen, onClose, onConfirm, loading
 *  - title: título del modal
 *  - description: JSX o string describiendo qué se va a eliminar
 *  - confirmValue: string exacto que el usuario debe tipear para habilitar el botón
 *  - confirmLabel: label del input (ej: "Escribí el número de expediente para confirmar")
 */
export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Confirmar eliminación',
  description,
  confirmValue,
  confirmLabel,
}) {
  const { theme } = useTheme();
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (isOpen) setTyped('');
  }, [isOpen]);

  if (!isOpen) return null;

  const matches = typed.trim() === String(confirmValue ?? '').trim();

  const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px',
  };

  const modalStyle = {
    background: theme.contentBg,
    borderRadius: '16px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header rojo */}
        <div style={{
          padding: '20px 24px 16px',
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '24px' }}>🗑️</span>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#fff' }}>
            {title}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Descripción */}
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            fontSize: '13.5px',
            color: '#7f1d1d',
            lineHeight: 1.6,
          }}>
            {description}
          </div>

          {/* Warning */}
          <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary }}>
            ⚠️ Esta acción es <strong style={{ color: theme.text }}>irreversible</strong>.
            Para confirmar, escribí exactamente:
          </p>

          {/* Valor esperado */}
          <div style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: theme.mainBg,
            border: `1px solid ${theme.border}`,
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 700,
            color: theme.text,
            userSelect: 'all',
            letterSpacing: '0.03em',
          }}>
            {confirmValue}
          </div>

          {/* Input */}
          <div>
            {confirmLabel && (
              <label style={{ fontSize: '12px', fontWeight: 500, color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                {confirmLabel}
              </label>
            )}
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`Escribí "${confirmValue}"`}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1.5px solid ${matches && typed ? '#dc2626' : theme.inputBorder}`,
                background: theme.inputBg,
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px', borderRadius: '9px',
                border: `1px solid ${theme.border}`,
                background: theme.contentBg, color: theme.text,
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!matches || loading}
              style={{
                padding: '10px 20px', borderRadius: '9px',
                border: 'none',
                background: matches && !loading ? '#dc2626' : '#fca5a5',
                color: '#fff',
                fontSize: '13px', fontWeight: 600,
                cursor: matches && !loading ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
