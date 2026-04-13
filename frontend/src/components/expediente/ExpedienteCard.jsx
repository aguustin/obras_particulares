import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PlanoCard from '../plano/PlanoCard';

export default function ExpedienteCard({ expediente, planos = [], onPlanoClick, selectedPlanoId }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        background: theme.contentBg,
        boxShadow: theme.shadow,
      }}
    >
      {/* Expediente header */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          background: expanded ? theme.accentLight : theme.contentBg,
          borderBottom: expanded ? `1px solid ${theme.border}` : 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!expanded) e.currentTarget.style.background = theme.mainBg;
        }}
        onMouseLeave={(e) => {
          if (!expanded) e.currentTarget.style.background = theme.contentBg;
        }}
      >
        <span style={{ fontSize: '16px' }}>📁</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>
            {expediente.numero}
          </div>
          {expediente.descripcion && (
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '1px' }}>
              {expediente.descripcion}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: theme.mainBg,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            {planos.length} plano{planos.length !== 1 ? 's' : ''}
          </span>
          <span style={{ color: theme.textMuted, fontSize: '12px' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {planos.length === 0 ? (
            <p style={{ fontSize: '13px', color: theme.textMuted, textAlign: 'center', padding: '12px' }}>
              Sin planos con el filtro actual
            </p>
          ) : (
            planos.map((plano) => (
              <PlanoCard
                key={plano._id}
                plano={plano}
                onClick={onPlanoClick}
                isSelected={selectedPlanoId === plano._id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
