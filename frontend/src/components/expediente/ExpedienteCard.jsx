import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import PlanoCard from '../plano/PlanoCard';
import AutorizarModal from './AutorizarModal';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import { deleteExpediente } from '../../services/expedienteService';

export default function ExpedienteCard({ expediente, planos = [], onPlanoClick, selectedPlanoId, onDelete }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [autorizarOpen, setAutorizarOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpediente(expediente._id);
      setDeleteOpen(false);
      if (onDelete) onDelete(expediente._id);
    } catch (e) {
      alert(e.response?.data?.message || 'Error al eliminar el expediente');
    } finally {
      setDeleting(false);
    }
  };

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

          {user?.rol === 'ADMIN' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setAutorizarOpen(true); }}
                title="Gestionar accesos"
                style={{
                  padding: '4px 10px', borderRadius: '6px',
                  background: theme.mainBg, border: `1px solid ${theme.border}`,
                  color: theme.textSecondary, fontSize: '11px', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; }}
              >
                🔑 Accesos
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                title="Eliminar expediente"
                style={{
                  padding: '5px 10px', borderRadius: '6px',
                  background: theme.mainBg, border: `1px solid ${theme.border}`,
                  color: '#dc2626', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', lineHeight: 1,
                }}
              >
                ✕
              </button>
            </>
          )}

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
                onClick={(p) => onPlanoClick(p, expediente.usuarios_autorizados || [])}
                isSelected={selectedPlanoId === plano._id}
              />
            ))
          )}
        </div>
      )}

      <AutorizarModal
        isOpen={autorizarOpen}
        onClose={() => setAutorizarOpen(false)}
        expedienteId={expediente._id}
        expedienteNumero={expediente.numero}
      />

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar expediente"
        description={
          <>
            Se eliminará el expediente <strong>{expediente.numero}</strong> junto con
            todos sus <strong>{planos.length} plano{planos.length !== 1 ? 's' : ''}</strong> y
            sus versiones asociadas.
          </>
        }
        confirmValue={expediente.numero}
        confirmLabel="Escribí el número de expediente para confirmar"
      />
    </div>
  );
}
