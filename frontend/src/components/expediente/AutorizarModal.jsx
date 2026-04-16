import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { getExpediente, authorizeUser, deauthorizeUser } from '../../services/expedienteService';

const ROL_LABEL = { PROFESIONAL: 'Profesional', TECNICO: 'Técnico', ADMIN: 'Admin' };
const ROL_COLOR = {
  PROFESIONAL: { bg: '#ede9fe', text: '#6d28d9' },
  TECNICO: { bg: '#dbeafe', text: '#1d4ed8' },
  ADMIN: { bg: '#fee2e2', text: '#dc2626' },
};

export default function AutorizarModal({ isOpen, onClose, expedienteId, expedienteNumero }) {
  const { theme } = useTheme();

  const [usuarios, setUsuarios] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [email, setEmail] = useState('');
  const [authorizing, setAuthorizing] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsuarios = useCallback(async () => {
    if (!expedienteId) return;
    setLoadingData(true);
    try {
      const res = await getExpediente(expedienteId);
      setUsuarios(res.data.data.usuarios_autorizados || []);
    } catch {
      setError('No se pudo cargar la lista de usuarios autorizados.');
    } finally {
      setLoadingData(false);
    }
  }, [expedienteId]);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError('');
      setSuccessMsg('');
      fetchUsuarios();
    }
  }, [isOpen, fetchUsuarios]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    setAuthorizing(true);
    try {
      const res = await authorizeUser(expedienteId, email.trim());
      setUsuarios(res.data.data.usuarios_autorizados || []);
      setEmail('');
      showSuccess(res.data.message || 'Usuario autorizado');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al autorizar usuario');
    } finally {
      setAuthorizing(false);
    }
  };

  const handleDeauthorize = async (userId) => {
    setError('');
    setRemovingId(userId);
    try {
      const res = await deauthorizeUser(expedienteId, userId);
      setUsuarios(res.data.data.usuarios_autorizados || []);
      showSuccess('Permiso removido');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al quitar permiso');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestionar accesos — ${expedienteNumero}`}
      maxWidth="500px"
    >
      {/* Agregar usuario */}
      <form onSubmit={handleAuthorize} style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: theme.textSecondary,
            marginBottom: '8px',
          }}
        >
          Autorizar usuario por email
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            disabled={authorizing}
            style={{
              flex: 1,
              padding: '10px 13px',
              borderRadius: '9px',
              border: `1.5px solid ${theme.inputBorder}`,
              background: theme.inputBg,
              color: theme.text,
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = theme.inputFocus)}
            onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
          />
          <button
            type="submit"
            disabled={authorizing || !email.trim()}
            style={{
              padding: '10px 18px',
              borderRadius: '9px',
              background:
                authorizing || !email.trim()
                  ? theme.textMuted
                  : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: authorizing || !email.trim() ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {authorizing ? 'Autorizando...' : 'Autorizar'}
          </button>
        </div>
      </form>

      {/* Mensajes */}
      {error && (
        <div
          style={{
            padding: '10px 13px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}
      {successMsg && (
        <div
          style={{
            padding: '10px 13px',
            borderRadius: '8px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Lista de usuarios autorizados */}
      <div>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: theme.textSecondary,
            margin: '0 0 10px',
          }}
        >
          Usuarios con acceso
          {!loadingData && (
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '10px',
                background: theme.mainBg,
                border: `1px solid ${theme.border}`,
                fontSize: '11px',
                color: theme.textMuted,
              }}
            >
              {usuarios.length}
            </span>
          )}
        </p>

        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <Spinner size={28} />
          </div>
        ) : usuarios.length === 0 ? (
          <p
            style={{
              fontSize: '13px',
              color: theme.textMuted,
              textAlign: 'center',
              padding: '20px',
              border: `1px dashed ${theme.border}`,
              borderRadius: '8px',
            }}
          >
            Ningún usuario autorizado todavía
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {usuarios.map((u) => {
              const rolStyle = ROL_COLOR[u.rol] || { bg: theme.mainBg, text: theme.textSecondary };
              return (
                <div
                  key={u._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: `1px solid ${theme.border}`,
                    background: theme.mainBg,
                  }}
                >
                  {/* Avatar inicial */}
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {u.nombre?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: theme.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {u.nombre}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: theme.textSecondary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {u.email}
                    </div>
                  </div>

                  {/* Rol badge */}
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: rolStyle.bg,
                      color: rolStyle.text,
                      flexShrink: 0,
                    }}
                  >
                    {ROL_LABEL[u.rol] || u.rol}
                  </span>

                  {/* Quitar permisos */}
                  <button
                    onClick={() => handleDeauthorize(u._id)}
                    disabled={removingId === u._id}
                    title="Quitar permisos"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '7px',
                      background: removingId === u._id ? theme.mainBg : '#fef2f2',
                      border: `1px solid ${removingId === u._id ? theme.border : '#fecaca'}`,
                      color: removingId === u._id ? theme.textMuted : '#dc2626',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: removingId === u._id ? 'not-allowed' : 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {removingId === u._id ? '...' : 'Quitar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
