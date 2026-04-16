import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Spinner from '../common/Spinner';
import {
  getTecnicos, approveTecnico, rejectTecnico,
  toggleActivo, updatePermisos,
} from '../../services/adminService';

const TIPOS = [
  { key: 'DEMOLICION',   label: 'Demolición' },
  { key: 'SANITARIO',    label: 'Sanitario'  },
  { key: 'INCENDIO',     label: 'Incendio'   },
  { key: 'ESTRUCTURA',   label: 'Estructura' },
  { key: 'ARQUITECTURA', label: 'Arquitectura' },
  { key: 'ELECTRICO',    label: 'Eléctrico'  },
];

function PermisoChips({ tecnico, onSave }) {
  const { theme } = useTheme();
  const [permisos, setPermisos] = useState(tecnico.permisos_planos || []);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const toggle = (key) => {
    setPermisos((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(tecnico._id, permisos);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
      {TIPOS.map(({ key, label }) => {
        const active = permisos.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            disabled={!tecnico.activo || tecnico.pendienteAprobacion}
            style={{
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
              border: `1px solid ${active ? '#7c3aed' : theme.border}`,
              background: active ? '#ede9fe' : theme.mainBg,
              color: active ? '#6d28d9' : theme.textMuted,
              cursor: tecnico.activo && !tecnico.pendienteAprobacion ? 'pointer' : 'default',
              transition: 'all 0.12s',
              opacity: !tecnico.activo || tecnico.pendienteAprobacion ? 0.5 : 1,
            }}
          >
            {label}
          </button>
        );
      })}
      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            border: 'none',
            background: saving ? theme.textMuted : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? '...' : 'Guardar'}
        </button>
      )}
    </div>
  );
}

export default function TecnicosPanel() {
  const { theme } = useTheme();
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [confirmReject, setConfirmReject] = useState(null); // tecnico a rechazar

  const fetchTecnicos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTecnicos();
      setTecnicos(res.data.data);
    } catch {
      setError('No se pudo cargar la lista de técnicos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

  const flash = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3500);
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveTecnico(id);
      setTecnicos((prev) => prev.map((t) => t._id === id ? res.data.data : t));
      flash(res.data.message);
    } catch (err) {
      flash(err.response?.data?.message || 'Error al aprobar');
    }
  };

  const handleReject = async (tecnico) => {
    try {
      await rejectTecnico(tecnico._id);
      setTecnicos((prev) => prev.filter((t) => t._id !== tecnico._id));
      flash('Solicitud rechazada y técnico notificado');
    } catch (err) {
      flash(err.response?.data?.message || 'Error al rechazar');
    } finally {
      setConfirmReject(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleActivo(id);
      setTecnicos((prev) => prev.map((t) => t._id === id ? res.data.data : t));
      flash(res.data.message);
    } catch (err) {
      flash(err.response?.data?.message || 'Error');
    }
  };

  const handlePermisos = async (id, permisos_planos) => {
    const res = await updatePermisos(id, permisos_planos);
    setTecnicos((prev) => prev.map((t) => t._id === id ? res.data.data : t));
    flash('Permisos actualizados');
  };

  const pendientes = tecnicos.filter((t) => t.pendienteAprobacion);
  const aprobados  = tecnicos.filter((t) => !t.pendienteAprobacion);

  const estadoBadge = (t) => {
    if (t.pendienteAprobacion) return { label: 'Pendiente', bg: '#fef3c7', color: '#92400e' };
    if (!t.activo)             return { label: 'Dado de baja', bg: '#fee2e2', color: '#991b1b' };
    return                            { label: 'Activo', bg: '#d1fae5', color: '#065f46' };
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
          Gestión de Técnicos
        </h1>
        <p style={{ fontSize: '13.5px', color: theme.textSecondary, margin: 0 }}>
          Aprobá solicitudes, asigná permisos de visualización y gestioná el acceso.
        </p>
      </div>

      {/* Mensaje flash */}
      {actionMsg && (
        <div style={{
          padding: '11px 16px', borderRadius: '9px', marginBottom: '20px',
          background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '13.5px',
        }}>
          {actionMsg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <Spinner size={36} />
        </div>
      ) : error ? (
        <div style={{ padding: '16px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      ) : (
        <>
          {/* ── Solicitudes pendientes ───────────────────────────────────── */}
          {pendientes.length > 0 && (
            <section style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: theme.text, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Solicitudes pendientes
                <span style={{ padding: '2px 9px', borderRadius: '10px', background: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 700 }}>
                  {pendientes.length}
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendientes.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 18px', borderRadius: '12px',
                      border: `1px solid #fde68a`, background: '#fffbeb',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>
                        {t.nombre} {t.apellido}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                        {t.email} · DNI {t.dni}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleApprove(t._id)}
                        style={{
                          padding: '7px 16px', borderRadius: '8px', border: 'none',
                          background: 'linear-gradient(135deg, #059669, #10b981)',
                          color: '#fff', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => setConfirmReject(t)}
                        style={{
                          padding: '7px 16px', borderRadius: '8px',
                          border: '1px solid #fecaca', background: '#fef2f2',
                          color: '#dc2626', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Tabla de técnicos aprobados ──────────────────────────────── */}
          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: theme.text, margin: '0 0 14px' }}>
              Técnicos registrados
              <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 500, color: theme.textMuted }}>
                ({aprobados.length})
              </span>
            </h2>

            {aprobados.length === 0 ? (
              <p style={{ fontSize: '14px', color: theme.textMuted, padding: '24px', textAlign: 'center', border: `1px dashed ${theme.border}`, borderRadius: '10px' }}>
                No hay técnicos registrados todavía
              </p>
            ) : (
              <div style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden', background: theme.contentBg }}>
                {/* Encabezado tabla */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 100px 1fr 200px 110px 100px',
                  padding: '10px 18px',
                  background: theme.mainBg,
                  borderBottom: `1px solid ${theme.border}`,
                  fontSize: '11px', fontWeight: 700, color: theme.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.07em', gap: '12px',
                }}>
                  <span>Nombre completo</span>
                  <span>DNI</span>
                  <span>Email</span>
                  <span>Permisos de planos</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>

                {/* Filas */}
                {aprobados.map((t, i) => {
                  const badge = estadoBadge(t);
                  return (
                    <div
                      key={t._id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 100px 1fr 200px 110px 100px',
                        padding: '13px 18px', gap: '12px', alignItems: 'center',
                        borderBottom: i < aprobados.length - 1 ? `1px solid ${theme.border}` : 'none',
                        opacity: t.activo ? 1 : 0.65,
                      }}
                    >
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: theme.text }}>
                        {t.nombre} {t.apellido}
                      </span>
                      <span style={{ fontSize: '13px', color: theme.textSecondary }}>
                        {t.dni || '—'}
                      </span>
                      <span style={{ fontSize: '12.5px', color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.email}
                      </span>
                      <PermisoChips tecnico={t} onSave={handlePermisos} />
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '3px 9px', borderRadius: '6px', width: 'fit-content',
                        fontSize: '11px', fontWeight: 600,
                        background: badge.bg, color: badge.color,
                      }}>
                        {badge.label}
                      </span>
                      <button
                        onClick={() => handleToggle(t._id)}
                        style={{
                          padding: '5px 10px', borderRadius: '7px', fontSize: '11.5px', fontWeight: 500,
                          border: `1px solid ${t.activo ? '#fecaca' : '#bbf7d0'}`,
                          background: t.activo ? '#fef2f2' : '#f0fdf4',
                          color: t.activo ? '#dc2626' : '#16a34a',
                          cursor: 'pointer',
                        }}
                      >
                        {t.activo ? 'Dar de baja' : 'Reactivar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal confirmación de rechazo */}
      {confirmReject && (
        <div
          onClick={() => setConfirmReject(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '16px', backdropFilter: 'blur(2px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.contentBg, borderRadius: '16px', padding: '28px',
              maxWidth: '400px', width: '100%', boxShadow: theme.shadowLg,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '42px' }}>⚠️</div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: theme.text, margin: '0 0 10px', textAlign: 'center' }}>
              Rechazar solicitud
            </h3>
            <p style={{ fontSize: '14px', color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6, margin: '0 0 24px' }}>
              ¿Confirmar el rechazo de <strong style={{ color: theme.text }}>{confirmReject.nombre} {confirmReject.apellido}</strong>?
              Se eliminará su registro y recibirá un email de notificación.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmReject(null)}
                style={{ flex: 1, padding: '11px', borderRadius: '9px', background: theme.mainBg, border: `1px solid ${theme.border}`, color: theme.textSecondary, fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => handleReject(confirmReject)}
                style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
