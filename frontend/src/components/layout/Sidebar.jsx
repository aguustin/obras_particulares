import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFilters } from '../../contexts/FilterContext';
import { useDebounce } from '../../hooks/useDebounce';
import { downloadBackup } from '../../services/adminService';

const FILTER_GROUPS = [
  {
    key: 'PRESENTADO',
    label: 'Presentados',
    icon: '📄',
    hasPendiente: true,
  },
  {
    key: 'EN_PROGRESO',
    label: 'En Progreso',
    icon: '🔄',
    hasPendiente: true,
  },
  {
    key: 'OBSERVADOS',
    label: 'Observados',
    icon: '🔍',
    hasPendiente: false,
  },
  {
    key: 'PRE_APROBADO',
    label: 'Pre-Aprobados',
    icon: '✅',
    hasPendiente: false,
  },
];

function Switch({ checked, onChange, label, theme }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '12px',
        color: theme.sidebarSubtext,
        userSelect: 'none',
      }}
    >
      <span
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          width: '32px',
          height: '18px',
          borderRadius: '9px',
          background: checked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
          transition: 'background 0.2s',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '16px' : '2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: checked ? theme.sidebarBg : 'rgba(255,255,255,0.6)',
            transition: 'left 0.2s',
          }}
        />
      </span>
      {label}
    </label>
  );
}

function FilterGroup({ group, active, pendiente, onSelect, theme }) {
  const isActive = active === group.key;

  return (
    <div
      style={{
        borderRadius: '10px',
        overflow: 'hidden',
        background: isActive ? theme.sidebarActiveFilter : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <button
        onClick={() => onSelect(group.key, null)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '9px 12px',
          color: theme.sidebarText,
          fontSize: '13.5px',
          fontWeight: isActive ? 600 : 400,
          letterSpacing: '-0.01em',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '16px' }}>{group.icon}</span>
        {group.label}
      </button>

      {isActive && group.hasPendiente && (
        <div style={{ padding: '4px 12px 10px 38px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Switch
            checked={pendiente === true}
            onChange={(v) => onSelect(group.key, v ? true : null)}
            label="Pendientes"
            theme={theme}
          />
          <Switch
            checked={pendiente === false}
            onChange={(v) => onSelect(group.key, v ? false : null)}
            label="No pendientes"
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { theme, isDark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { filters, setEstado, setSearch, setSearchBy, reset } = useFilters();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/admin');
  const [searchInput, setSearchInput] = useState('');
  const [backupConfirmOpen, setBackupConfirmOpen] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupError, setBackupError] = useState('');

  const handleBackupConfirm = async () => {
    setBackupLoading(true);
    setBackupError('');
    try {
      await downloadBackup();
      setBackupConfirmOpen(false);
    } catch {
      setBackupError('No se pudo generar el backup. Intentá de nuevo.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setSearch(val);
  };

  const handleSelect = (estado, pendiente) => {
    setEstado(estado, pendiente);
  };

  const initials = user?.nombre
    ? user.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        backgroundColor: theme.sidebarBg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Header */}
      <div style={{ padding: '22px 20px 14px', borderBottom: `1px solid ${theme.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: theme.sidebarText, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              Godoy Cruz
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: theme.sidebarSubtext, marginTop: '3px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Obras Particulares
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: theme.sidebarButtonBg,
              color: theme.sidebarText,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              flexShrink: 0,
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* User info */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${theme.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700,
            color: theme.sidebarText,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: theme.sidebarText,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}
          >
            {user?.nombre}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 500, color: theme.sidebarSubtext, letterSpacing: '0.02em' }}>
            {user?.rol}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: theme.sidebarSubtext, letterSpacing: '0.1em', padding: '0 8px 8px', textTransform: 'uppercase' }}>
          Filtros
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* All */}
          <button
            onClick={reset}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              color: theme.sidebarText,
              fontSize: '13.5px',
              fontWeight: !filters.estado ? 600 : 400,
              letterSpacing: '-0.01em',
              background: !filters.estado ? theme.sidebarActiveFilter : 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '10px',
            }}
          >
            <span style={{ fontSize: '16px' }}>🏠</span>
            Todos
          </button>

          {FILTER_GROUPS.map((group) => (
            <FilterGroup
              key={group.key}
              group={group}
              active={filters.estado}
              pendiente={filters.pendiente}
              onSelect={handleSelect}
              theme={theme}
            />
          ))}
        </div>

        <div style={{ marginTop: '16px', marginBottom: '8px', height: '1px', background: theme.sidebarBorder }} />

        {/* Search */}
        <div style={{ padding: '0 0 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: theme.sidebarSubtext, letterSpacing: '0.1em', padding: '0 8px 8px', textTransform: 'uppercase' }}>
            Búsqueda
          </div>

          <select
            value={filters.searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: theme.sidebarInputBg,
              color: theme.sidebarInputText,
              fontSize: '13px',
              marginBottom: '8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="padron" style={{ color: '#000' }}>Por padrón</option>
            <option value="expediente" style={{ color: '#000' }}>Por expediente</option>
          </select>

          <input
            type="text"
            placeholder={filters.searchBy === 'padron' ? 'Buscar padrón...' : 'Buscar expediente...'}
            value={searchInput}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: theme.sidebarInputBg,
              color: theme.sidebarInputText,
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Admin actions */}
      {user?.rol === 'ADMIN' && (
        <div style={{ padding: '8px 16px 0', borderTop: `1px solid ${theme.sidebarBorder}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Gestión de técnicos */}
          <button
            onClick={() => isAdminPanel ? navigate('/') : navigate('/admin/tecnicos')}
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: '8px',
              background: isAdminPanel ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)',
              color: theme.sidebarText,
              border: `1px solid ${theme.sidebarBorder}`,
              fontSize: '12.5px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = isAdminPanel ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)')}
          >
            <span>👷</span> {isAdminPanel ? 'Volver al dashboard' : 'Gestión de técnicos'}
          </button>

          <button
            onClick={() => { setBackupError(''); setBackupConfirmOpen(true); }}
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.07)',
              color: theme.sidebarText,
              border: `1px solid ${theme.sidebarBorder}`,
              fontSize: '12.5px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <span>💾</span> Backup base de datos
          </button>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '12px 16px', borderTop: user?.rol === 'ADMIN' ? 'none' : `1px solid ${theme.sidebarBorder}`, paddingTop: user?.rol === 'ADMIN' ? '8px' : '12px' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '9px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.07)',
            color: theme.sidebarText,
            border: `1px solid ${theme.sidebarBorder}`,
            fontSize: '12.5px',
            fontWeight: 500,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
      {/* Modal de confirmación de backup */}
      {backupConfirmOpen && (
        <div
          onClick={() => !backupLoading && setBackupConfirmOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.contentBg,
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              padding: '28px 28px 24px',
              boxShadow: theme.shadowLg,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* Ícono */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '42px' }}>💾</span>
            </div>

            {/* Título */}
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: theme.text,
                margin: '0 0 10px',
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              Crear copia de seguridad
            </h2>

            {/* Descripción */}
            <p
              style={{
                fontSize: '13.5px',
                color: theme.textSecondary,
                lineHeight: 1.65,
                margin: '0 0 8px',
                textAlign: 'center',
              }}
            >
              Se va a generar y descargar un archivo <strong style={{ color: theme.text }}>JSON</strong> con
              toda la información de la base de datos: usuarios, padrón, expedientes, planos y versiones.
            </p>
            <p
              style={{
                fontSize: '12.5px',
                color: theme.textMuted,
                lineHeight: 1.55,
                margin: '0 0 22px',
                textAlign: 'center',
              }}
            >
              Guardá el archivo en un lugar seguro. Puede usarse para restaurar datos en caso de falla.
            </p>

            {/* Error */}
            {backupError && (
              <div
                style={{
                  padding: '10px 13px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '13px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                {backupError}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setBackupConfirmOpen(false)}
                disabled={backupLoading}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '9px',
                  background: theme.mainBg,
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                  fontSize: '13.5px',
                  fontWeight: 500,
                  cursor: backupLoading ? 'not-allowed' : 'pointer',
                  opacity: backupLoading ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleBackupConfirm}
                disabled={backupLoading}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '9px',
                  background: backupLoading
                    ? theme.textMuted
                    : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: backupLoading ? 'not-allowed' : 'pointer',
                  opacity: backupLoading ? 0.7 : 1,
                }}
              >
                {backupLoading ? 'Generando...' : 'Descargar backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
