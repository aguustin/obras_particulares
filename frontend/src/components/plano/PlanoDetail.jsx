import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import { getVersionesByPlano, uploadVersion, addComentario, addObservacion, getDownloadUrl, updateDescripcion, updateArchivos } from '../../services/versionService';
import { updatePlano, deletePlano } from '../../services/planoService';

const ESTADOS = ['PRESENTADO', 'EN_PROGRESO', 'OBSERVADO', 'PRE_APROBADO'];
const ESTADO_LABELS = {
  PRESENTADO: 'Presentado',
  EN_PROGRESO: 'En Progreso',
  OBSERVADO: 'Observado',
  PRE_APROBADO: 'Pre-Aprobado',
};

const TIPO_ICONS = {
  ARQUITECTURA: '🏛️',
  ESTRUCTURA: '🔩',
  SANITARIO: '🚿',
  ELECTRICO: '⚡',
  INCENDIO: '🔥',
  DEMOLICION: '⛏️',
};

function VersionItem({ version, plano, theme, user, canInteract, onComentario, onObservacion, onDescripcionUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [comentario, setComentario] = useState('');
  const [loadingComentario, setLoadingComentario] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(version.descripcion || '');
  const [editKeptArchivos, setEditKeptArchivos] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  // Normalise: use archivos[] if present, else build from legacy single-file fields
  const archivos = (version.archivos && version.archivos.length > 0)
    ? version.archivos
    : (version.archivo_pdf_url ? [{ url: version.archivo_pdf_url, key: version.archivo_pdf_key, nombre: 'documento.pdf' }] : []);

  // A version is editable when it has no observation yet and plano is in a mutable state
  const isEditable =
    !version.observacion_tecnica &&
    plano &&
    ['PRESENTADO', 'EN_PROGRESO'].includes(plano.estado_actual);

  const canEdit = isEditable && (user?.rol === 'ADMIN' || user?.rol === 'PROFESIONAL');

  const startEditing = (e) => {
    e.stopPropagation();
    setEditDesc(version.descripcion || '');
    setEditKeptArchivos([...archivos]);
    setEditNewFiles([]);
    setEditing(true);
    setExpanded(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditDesc(version.descripcion || '');
    setEditKeptArchivos([]);
    setEditNewFiles([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const descChanged = editDesc !== (version.descripcion || '');
      const filesChanged = editKeptArchivos.length !== archivos.length || editNewFiles.length > 0;

      if (descChanged) {
        await updateDescripcion(version._id, editDesc);
      }
      if (filesChanged) {
        const formData = new FormData();
        editKeptArchivos.forEach((a) => formData.append('keepKeys', a.key));
        editNewFiles.forEach((f) => formData.append('pdf', f));
        await updateArchivos(version._id, formData);
      }
      setEditing(false);
      if (onDescripcionUpdated) onDescripcionUpdated();
    } catch (e) {
      alert(e.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (index) => {
    setDownloadingIndex(index);
    try {
      const res = await getDownloadUrl(version._id, index);
      window.open(res.data.data.url, '_blank');
    } catch {
      window.open(archivos[index]?.url, '_blank');
    } finally {
      setDownloadingIndex(null);
    }
  };

  const submitComentario = async () => {
    if (!comentario.trim()) return;
    setLoadingComentario(true);
    try {
      await onComentario(version._id, comentario);
      setComentario('');
    } finally {
      setLoadingComentario(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        border: `1px solid ${editing ? theme.accent : theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        background: theme.mainBg,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Version header */}
      <div
        onClick={() => !editing && setExpanded((v) => !v)}
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: editing ? 'default' : 'pointer',
          background: theme.contentBg,
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${theme.accent}, #6366f1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          v{version.numero_version}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>
              {version.descripcion || `Versión ${version.numero_version}`}
            </span>
            {canEdit && !editing && (
              <button
                onClick={startEditing}
                title="Editar versión"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: theme.textMuted, fontSize: '12px', padding: '0 2px', lineHeight: 1,
                }}
              >
                ✎
              </button>
            )}
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted }}>
            {version.subido_por?.nombre} · {formatDate(version.fecha)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {version.observacion_tecnica && (
            <span title="Tiene observación" style={{ fontSize: '14px' }}>🔍</span>
          )}
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
            background: theme.accentLight, color: theme.accent,
            border: `1px solid ${theme.accent}40`, fontWeight: 600,
          }}>
            📄 {archivos.length} PDF{archivos.length !== 1 ? 's' : ''}
          </span>
          {!editing && (
            <span style={{ color: theme.textMuted, fontSize: '12px' }}>
              {expanded ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>

      {/* Edit panel */}
      {editing && (
        <div style={{ padding: '16px', borderTop: `1px solid ${theme.accent}40`, display: 'flex', flexDirection: 'column', gap: '14px', background: theme.mainBg }}>
          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>
              Descripción
            </label>
            <input
              autoFocus
              type="text"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder={`Versión ${version.numero_version}`}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                border: `1px solid ${theme.border}`, background: theme.inputBg,
                color: theme.text, fontSize: '13px', outline: 'none',
              }}
            />
          </div>

          {/* File management */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
              Archivos PDF
            </label>

            {/* Existing files */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {editKeptArchivos.map((archivo, i) => (
                <div key={archivo.key} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px',
                  borderRadius: '8px', background: theme.contentBg, border: `1px solid ${theme.border}`,
                }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>📄</span>
                  <span style={{ flex: 1, fontSize: '12px', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {archivo.nombre || `Archivo ${i + 1}`}
                  </span>
                  <span style={{ fontSize: '11px', color: theme.textMuted, flexShrink: 0 }}>existente</span>
                  <button
                    onClick={() => setEditKeptArchivos((prev) => prev.filter((a) => a.key !== archivo.key))}
                    title="Quitar archivo"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '13px', padding: '0 2px' }}
                  >✕</button>
                </div>
              ))}
              {editNewFiles.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px',
                  borderRadius: '8px', background: theme.accentLight, border: `1px solid ${theme.accent}40`,
                }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>📄</span>
                  <span style={{ flex: 1, fontSize: '12px', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                  <span style={{ fontSize: '11px', color: theme.accent, flexShrink: 0 }}>nuevo</span>
                  <button
                    onClick={() => setEditNewFiles((prev) => prev.filter((_, j) => j !== i))}
                    title="Quitar archivo"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '13px', padding: '0 2px' }}
                  >✕</button>
                </div>
              ))}
              {editKeptArchivos.length === 0 && editNewFiles.length === 0 && (
                <div style={{ fontSize: '12px', color: '#dc2626', padding: '6px 0' }}>
                  ⚠ Debe quedar al menos un PDF
                </div>
              )}
            </div>

            {/* Add more files */}
            <div>
              <input
                id={`edit-pdf-input-${version._id}`}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => setEditNewFiles((prev) => [...prev, ...Array.from(e.target.files)])}
              />
              <button
                onClick={() => document.getElementById(`edit-pdf-input-${version._id}`).click()}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  border: `1px dashed ${theme.border}`, background: 'transparent',
                  color: theme.textSecondary, cursor: 'pointer',
                }}
              >
                + Agregar PDFs
              </button>
            </div>
          </div>

          {/* Save / Cancel */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={cancelEditing} disabled={saving}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              loading={saving}
              disabled={editKeptArchivos.length === 0 && editNewFiles.length === 0}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      )}

      {/* Version details (expanded, not editing) */}
      {expanded && !editing && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `1px solid ${theme.border}` }}>

          {/* Lista de archivos PDF */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {archivos.map((archivo, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', borderRadius: '8px',
                  background: theme.mainBg, border: `1px solid ${theme.border}`,
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>📄</span>
                <span style={{ flex: 1, fontSize: '12px', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {archivo.nombre || `Archivo ${i + 1}`}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(i)}
                  loading={downloadingIndex === i}
                >
                  ⬇ Descargar
                </Button>
              </div>
            ))}
          </div>

          {/* Observacion tecnica */}
          {version.observacion_tecnica && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: theme.statusObservado.bg,
                border: `1px solid ${theme.statusObservado.border}`,
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.statusObservado.text, marginBottom: '6px' }}>
                🔍 Observación técnica
              </div>
              <p style={{ fontSize: '13px', color: theme.text }}>
                {version.observacion_tecnica.descripcion}
              </p>
              {version.observacion_tecnica.tecnico && (
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
                  Por: {version.observacion_tecnica.tecnico?.nombre} · {formatDate(version.observacion_tecnica.fecha)}
                </div>
              )}
              {version.observacion_tecnica.archivos_pdf?.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {version.observacion_tecnica.archivos_pdf.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12px', color: theme.accent, textDecoration: 'underline' }}
                    >
                      Anexo {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add observacion (TECNICO/ADMIN only, and only if authorized) */}
          {(user?.rol === 'ADMIN' || user?.rol === 'TECNICO') && canInteract && !version.observacion_tecnica && (
            <Button size="sm" variant="secondary" onClick={() => onObservacion(version)}>
              🔍 Agregar observación
            </Button>
          )}

          {/* Comentarios */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '8px' }}>
              Comentarios ({version.comentarios?.length || 0})
            </div>

            {version.comentarios?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {version.comentarios.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: theme.contentBg,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.accent }}>
                      {c.usuario?.nombre}
                      <span style={{ fontWeight: 400, color: theme.textMuted, marginLeft: '8px' }}>
                        {formatDate(c.fecha)}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: theme.text, marginTop: '4px' }}>
                      {c.mensaje}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {canInteract && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Agregar comentario..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComentario()}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    background: theme.inputBg,
                    color: theme.text,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <Button size="sm" onClick={submitComentario} loading={loadingComentario}>
                  Enviar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanoDetail({ plano, onClose, onUpdate, onDelete }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeletePlano = async () => {
    setDeleting(true);
    try {
      await deletePlano(plano._id);
      if (onDelete) onDelete(plano._id);
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Error al eliminar el plano');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  // ADMIN and PROFESIONAL always have full interaction rights.
  // A TECNICO can interact only if the admin authorized them on this specific expediente.
  const userId = user?.id ?? user?._id;
  const canInteract =
    user?.rol === 'ADMIN' ||
    user?.rol === 'PROFESIONAL' ||
    (user?.rol === 'TECNICO' &&
      !!userId &&
      (plano._usuariosAutorizados || []).some((rawId) => {
        const idStr = rawId && typeof rawId === 'object'
          ? (rawId._id ?? rawId).toString()
          : String(rawId ?? '');
        return idStr === String(userId);
      }));
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [obsModal, setObsModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [estadoChanging, setEstadoChanging] = useState(false);

  // Upload form
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadDesc, setUploadDesc] = useState('');

  // Obs form
  const [obsDesc, setObsDesc] = useState('');
  const [obsFiles, setObsFiles] = useState([]);

  const loadVersions = useCallback(async () => {
    setLoadingVersions(true);
    try {
      const res = await getVersionesByPlano(plano._id);
      setVersions(res.data.data);
    } finally {
      setLoadingVersions(false);
    }
  }, [plano._id]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      uploadFiles.forEach((f) => formData.append('pdf', f));
      if (uploadDesc) formData.append('descripcion', uploadDesc);
      await uploadVersion(plano._id, formData);
      setUploadModal(false);
      setUploadFiles([]);
      setUploadDesc('');
      loadVersions();
      if (onUpdate) onUpdate();
    } catch (e) {
      alert(e.response?.data?.message || 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleComentario = async (versionId, mensaje) => {
    await addComentario(versionId, mensaje);
    loadVersions();
  };

  const handleObservacion = async () => {
    if (!selectedVersion || !obsDesc) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('descripcion', obsDesc);
      for (const f of obsFiles) formData.append('archivos', f);
      await addObservacion(selectedVersion._id, formData);
      setObsModal(false);
      setObsDesc('');
      setObsFiles([]);
      loadVersions();
      if (onUpdate) onUpdate();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setUploading(false);
    }
  };

  const handleEstadoChange = async (estado) => {
    setEstadoChanging(true);
    try {
      await updatePlano(plano._id, { estado_actual: estado });
      if (onUpdate) onUpdate();
    } finally {
      setEstadoChanging(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: theme.contentBg,
        borderLeft: `1px solid ${theme.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '24px' }}>
          {TIPO_ICONS[plano.tipo] || '📋'}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: theme.text }}>
              {plano.tipo.charAt(0) + plano.tipo.slice(1).toLowerCase()}
            </h2>
            <Badge status={plano.estado_actual} />
            {plano.pendiente && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  fontWeight: 600,
                }}
              >
                ⏳ Pendiente
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
            Expediente: {plano.expedienteId?.numero || '—'}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ color: theme.textMuted, fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
        >
          ✕
        </button>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: '14px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {canInteract && (
          <Button size="sm" onClick={() => setUploadModal(true)}>
            ⬆ Subir versión
          </Button>
        )}

        {user?.rol === 'ADMIN' && !deleteConfirm && (
          <button
            onClick={() => setDeleteConfirm(true)}
            title="Eliminar plano"
            style={{
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid #fecaca', background: '#fef2f2',
              color: '#dc2626', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            🗑️ Eliminar
          </button>
        )}

        {user?.rol === 'ADMIN' && deleteConfirm && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 10px', borderRadius: '8px',
            background: '#fef2f2', border: '1px solid #fecaca',
          }}>
            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>
              ¿Eliminar este plano y sus versiones?
            </span>
            <button
              onClick={handleDeletePlano}
              disabled={deleting}
              style={{
                padding: '4px 10px', borderRadius: '6px', border: 'none',
                background: '#dc2626', color: '#fff', fontSize: '12px',
                fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? '...' : 'Confirmar'}
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              disabled={deleting}
              style={{
                padding: '4px 10px', borderRadius: '6px',
                border: `1px solid #fecaca`, background: 'transparent',
                color: '#dc2626', fontSize: '12px', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {(user?.rol === 'ADMIN' || user?.rol === 'TECNICO') && canInteract && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {ESTADOS.map((e) => (
              <button
                key={e}
                onClick={() => handleEstadoChange(e)}
                disabled={plano.estado_actual === e || estadoChanging}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: plano.estado_actual === e ? 'default' : 'pointer',
                  background: plano.estado_actual === e ? theme.accent : theme.mainBg,
                  color: plano.estado_actual === e ? '#fff' : theme.textSecondary,
                  border: `1px solid ${plano.estado_actual === e ? theme.accent : theme.border}`,
                  opacity: estadoChanging ? 0.6 : 1,
                }}
              >
                {ESTADO_LABELS[e]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Versions list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '12px' }}>
          Historial de versiones
        </div>

        {loadingVersions ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spinner />
          </div>
        ) : versions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: theme.textMuted,
              fontSize: '14px',
              border: `2px dashed ${theme.border}`,
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
            Sin versiones aún. ¡Subí la primera!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {versions.map((v) => (
              <VersionItem
                key={v._id}
                version={v}
                plano={plano}
                theme={theme}
                user={user}
                canInteract={canInteract}
                onComentario={handleComentario}
                onObservacion={(ver) => { setSelectedVersion(ver); setObsModal(true); }}
                onDescripcionUpdated={loadVersions}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} title="Subir nueva versión">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              placeholder="Descripción de esta versión..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.inputBg,
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
              Archivos PDF * <span style={{ fontWeight: 400, color: theme.textMuted }}>(podés seleccionar varios)</span>
            </label>
            <div
              style={{
                border: `2px dashed ${uploadFiles.length > 0 ? theme.accent : theme.border}`,
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                background: uploadFiles.length > 0 ? theme.accentLight : theme.mainBg,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => document.getElementById('pdf-upload-input').click()}
            >
              <input
                id="pdf-upload-input"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => setUploadFiles((prev) => [...prev, ...Array.from(e.target.files)])}
              />
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                {uploadFiles.length > 0 ? '✅' : '📄'}
              </div>
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                {uploadFiles.length > 0
                  ? `${uploadFiles.length} archivo${uploadFiles.length !== 1 ? 's' : ''} seleccionado${uploadFiles.length !== 1 ? 's' : ''}`
                  : 'Clic para seleccionar uno o más PDFs'}
              </div>
            </div>

            {/* Lista de archivos seleccionados */}
            {uploadFiles.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {uploadFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary }}>
                    <span>📄</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ color: theme.textMuted, flexShrink: 0 }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      onClick={() => setUploadFiles((prev) => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '12px', padding: '0 2px' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setUploadModal(false); setUploadFiles([]); }}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} loading={uploading} disabled={uploadFiles.length === 0}>
              Subir versión
            </Button>
          </div>
        </div>
      </Modal>

      {/* Observacion Modal */}
      <Modal isOpen={obsModal} onClose={() => setObsModal(false)} title="Agregar observación técnica">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
              Descripción de la observación *
            </label>
            <textarea
              value={obsDesc}
              onChange={(e) => setObsDesc(e.target.value)}
              rows={4}
              placeholder="Detallá las observaciones técnicas..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.inputBg,
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
              Archivos adjuntos (opcional, PDFs)
            </label>
            <div
              style={{
                border: `2px dashed ${obsFiles.length > 0 ? theme.accent : theme.border}`,
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                background: obsFiles.length > 0 ? theme.accentLight : theme.mainBg,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => document.getElementById('obs-pdf-input').click()}
            >
              <input
                id="obs-pdf-input"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => setObsFiles((prev) => [...prev, ...Array.from(e.target.files)])}
              />
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                {obsFiles.length > 0
                  ? `${obsFiles.length} archivo${obsFiles.length !== 1 ? 's' : ''} seleccionado${obsFiles.length !== 1 ? 's' : ''}`
                  : '+ Agregar PDFs (opcional)'}
              </div>
            </div>
            {obsFiles.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {obsFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary }}>
                    <span>📄</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ color: theme.textMuted, flexShrink: 0 }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      onClick={() => setObsFiles((prev) => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '12px', padding: '0 2px' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setObsModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleObservacion} loading={uploading} disabled={!obsDesc}>
              Guardar observación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
