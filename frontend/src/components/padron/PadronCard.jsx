import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ExpedienteCard from '../expediente/ExpedienteCard';

export default function PadronCard({ padron, expedientes = [], onPlanoClick, selectedPlanoId }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(true);

  const totalPlanos = expedientes.reduce((sum, e) => sum + (e.planos?.length || 0), 0);

  return (
    <div
      style={{
        borderRadius: '14px',
        border: `1px solid ${theme.border}`,
        background: theme.contentBg,
        overflow: 'hidden',
        boxShadow: theme.shadowMd,
      }}
    >
      {/* Padrón header */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${theme.sidebarBg}15, ${theme.contentBg})`,
          borderBottom: expanded ? `1px solid ${theme.border}` : 'none',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${theme.sidebarBg}, ${theme.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          🏠
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: theme.text }}>
            Padrón #{padron.numero}
          </div>
          {padron.direccion && (
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
              📍 {padron.direccion}
            </div>
          )}
          {padron.propietario && (
            <div style={{ fontSize: '12px', color: theme.textMuted }}>
              👤 {padron.propietario}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: theme.accentLight,
              color: theme.accent,
              fontWeight: 600,
              border: `1px solid ${theme.accent}40`,
            }}
          >
            {expedientes.length} exp.
          </span>
          <span style={{ fontSize: '11px', color: theme.textMuted }}>
            {totalPlanos} planos
          </span>
        </div>

        <span style={{ color: theme.textMuted, fontSize: '14px', marginLeft: '4px' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expedientes */}
      {expanded && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {expedientes.length === 0 ? (
            <p style={{ fontSize: '13px', color: theme.textMuted, textAlign: 'center' }}>
              Sin expedientes con el filtro actual
            </p>
          ) : (
            expedientes.map((exp) => (
              <ExpedienteCard
                key={exp._id}
                expediente={exp}
                planos={exp.planos || []}
                onPlanoClick={onPlanoClick}
                selectedPlanoId={selectedPlanoId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
