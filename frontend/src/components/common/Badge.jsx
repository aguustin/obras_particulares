import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const STATUS_LABELS = {
  PRESENTADO: 'Presentado',
  EN_PROGRESO: 'En Progreso',
  OBSERVADO: 'Observado',
  PRE_APROBADO: 'Pre-Aprobado',
};

export default function Badge({ status, label, small }) {
  const { theme } = useTheme();

  const key = `status${status?.charAt(0) + status?.slice(1).toLowerCase().replace(/_([a-z])/g, (m, c) => c.toUpperCase())}`;

  const styleMap = {
    PRESENTADO: theme.statusPresentado,
    EN_PROGRESO: theme.statusEnProgreso,
    OBSERVADO: theme.statusObservado,
    PRE_APROBADO: theme.statusPreAprobado,
  };

  const style = styleMap[status] || { bg: theme.border, text: theme.textSecondary, border: theme.border };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: small ? '2px 8px' : '3px 10px',
        borderRadius: '999px',
        fontSize: small ? '11px' : '12px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label || STATUS_LABELS[status] || status}
    </span>
  );
}
