import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Spinner from './Spinner';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  style: extraStyle = {},
}) {
  const { theme } = useTheme();

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '11px 22px', fontSize: '15px' },
  };

  const variants = {
    primary: {
      background: theme.buttonPrimary,
      color: theme.buttonPrimaryText,
      border: 'none',
      hover: theme.buttonPrimaryHover,
    },
    secondary: {
      background: 'transparent',
      color: theme.text,
      border: `1px solid ${theme.border}`,
      hover: theme.border,
    },
    danger: {
      background: '#dc2626',
      color: '#fff',
      border: 'none',
      hover: '#b91c1c',
    },
    ghost: {
      background: 'transparent',
      color: theme.textSecondary,
      border: 'none',
      hover: 'transparent',
    },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...s,
        background: v.background,
        color: v.color,
        border: v.border,
        borderRadius: '8px',
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        ...extraStyle,
      }}
    >
      {loading && <Spinner size={14} color={v.color} />}
      {children}
    </button>
  );
}
