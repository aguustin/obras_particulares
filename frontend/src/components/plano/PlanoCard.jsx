import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Badge from '../common/Badge';

const TIPO_ICONS = {
  ARQUITECTURA: '🏛️',
  ESTRUCTURA: '🔩',
  SANITARIO: '🚿',
  ELECTRICO: '⚡',
  INCENDIO: '🔥',
  DEMOLICION: '⛏️',
};

export default function PlanoCard({ plano, onClick, isSelected }) {
  const { theme } = useTheme();

  return (
    <div
      onClick={() => onClick(plano)}
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        border: `1px solid ${isSelected ? theme.accent : theme.border}`,
        background: isSelected ? theme.accentLight : theme.contentBg,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.15s ease',
        boxShadow: isSelected ? `0 0 0 2px ${theme.accent}22` : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = theme.borderHover;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = theme.border;
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{TIPO_ICONS[plano.tipo] || '📋'}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>
          {plano.tipo.charAt(0) + plano.tipo.slice(1).toLowerCase()}
        </div>
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '1px' }}>
          {plano.pendiente ? '⏳ Pendiente' : '✓ Al día'}
        </div>
      </div>

      <Badge status={plano.estado_actual} small />
    </div>
  );
}
