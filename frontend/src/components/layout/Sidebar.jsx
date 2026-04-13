import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFilters } from '../../contexts/FilterContext';
import { useDebounce } from '../../hooks/useDebounce';

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
          padding: '10px 12px',
          color: theme.sidebarText,
          fontSize: '14px',
          fontWeight: isActive ? 600 : 400,
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
  const [searchInput, setSearchInput] = useState('');

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
      <div style={{ padding: '24px 20px 16px', borderBottom: `1px solid ${theme.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: theme.sidebarText, lineHeight: 1.2 }}>
              Godoy Cruz
            </div>
            <div style={{ fontSize: '12px', color: theme.sidebarSubtext, marginTop: '2px' }}>
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
              fontSize: '16px',
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
            }}
          >
            {user?.nombre}
          </div>
          <div style={{ fontSize: '11px', color: theme.sidebarSubtext }}>
            {user?.rol}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.sidebarSubtext, letterSpacing: '0.08em', padding: '0 8px 8px', textTransform: 'uppercase' }}>
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
              padding: '10px 12px',
              color: theme.sidebarText,
              fontSize: '14px',
              fontWeight: !filters.estado ? 600 : 400,
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
          <div style={{ fontSize: '11px', fontWeight: 600, color: theme.sidebarSubtext, letterSpacing: '0.08em', padding: '0 8px 8px', textTransform: 'uppercase' }}>
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

      {/* Logout */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.sidebarBorder}` }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.12)',
            color: theme.sidebarText,
            border: `1px solid ${theme.sidebarBorder}`,
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
