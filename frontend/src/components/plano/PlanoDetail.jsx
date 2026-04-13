import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import { getVersionesByPlano, uploadVersion, addComentario, addObservacion, getDownloadUrl } from '../../services/versionService';
import { updatePlano } from '../../services/planoService';

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

function VersionItem({ version, theme, user, onComentario, onObservacion }) {
  const [expanded, setExpanded] = useState(false);
  const [comentario, setComentario] = useState('');
  const [loadingComentario, setLoadingComentario] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const res = await getDownloadUrl(version._id);
      window.open(res.data.data.url, '_blank');
    } catch (e) {
      // fallback to direct url
      window.open(version.archivo_pdf_url, '_blank');
    } finally {
      setDownloadLoading(false);
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
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        background: theme.mainBg,
      }}
    >
      {/* Version header */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>
            {version.descripcion || `Versión ${version.numero_version}`}
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted }}>
            {version.subido_por?.nombre} · {formatDate(version.fecha)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {version.observacion_tecnica && (
            <span title="Tiene observación" style={{ fontSize: '14px' }}>🔍</span>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            loading={downloadLoading}
          >
            ⬇ PDF
          </Button>
          <span style={{ color: theme.textMuted, fontSize: '12px' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Version details */}
      {expanded && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `1px solid ${theme.border}` }}>
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

          {/* Add observacion (TECNICO/ADMIN only) */}
          {(user?.rol === 'ADMIN' || user?.rol === 'TECNICO') && !version.observacion_tecnica && (
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
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanoDetail({ plano, onClose, onUpdate }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [obsModal, setObsModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [estadoChanging, setEstadoChanging] = useState(false);

  // Upload form
  const [uploadFile, setUploadFile] = useState(null);
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
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', uploadFile);
      if (uploadDesc) formData.append('descripcion', uploadDesc);
      await uploadVersion(plano._id, formData);
      setUploadModal(false);
      setUploadFile(null);
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
        <Button size="sm" onClick={() => setUploadModal(true)}>
          ⬆ Subir versión
        </Button>

        {(user?.rol === 'ADMIN' || user?.rol === 'TECNICO') && (
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
                theme={theme}
                user={user}
                onComentario={handleComentario}
                onObservacion={(ver) => { setSelectedVersion(ver); setObsModal(true); }}
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
              Archivo PDF *
            </label>
            <div
              style={{
                border: `2px dashed ${uploadFile ? theme.accent : theme.border}`,
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                background: uploadFile ? theme.accentLight : theme.mainBg,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => document.getElementById('pdf-upload-input').click()}
            >
              <input
                id="pdf-upload-input"
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => setUploadFile(e.target.files[0] || null)}
              />
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                {uploadFile ? uploadFile.name : 'Clic para seleccionar PDF'}
              </div>
              {uploadFile && (
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
                  {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setUploadModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} loading={uploading} disabled={!uploadFile}>
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
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(e) => setObsFiles(Array.from(e.target.files))}
              style={{ fontSize: '13px', color: theme.text }}
            />
            {obsFiles.length > 0 && (
              <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px' }}>
                {obsFiles.length} archivo(s) seleccionado(s)
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
