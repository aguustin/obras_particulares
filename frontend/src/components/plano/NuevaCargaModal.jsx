import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { buscarExpediente, cargaInicial } from '../../services/planoService';

const TIPOS = [
  { value: 'ARQUITECTURA', label: 'Arquitectura', icon: '🏛️' },
  { value: 'ESTRUCTURA',   label: 'Estructura',   icon: '🔩' },
  { value: 'SANITARIO',    label: 'Sanitario',    icon: '🚿' },
  { value: 'ELECTRICO',    label: 'Eléctrico',    icon: '⚡' },
  { value: 'INCENDIO',     label: 'Incendio',     icon: '🔥' },
  { value: 'DEMOLICION',   label: 'Demolición',   icon: '⛏️' },
];

// Permite: E, E1, E2 (o cualquier letra seguida opcionalmente de un dígito)
const EXPEDIENTE_REGEX = /^\d{4}-[A-Z]\d?-\d+$/;

const STEPS = { BUSQUEDA: 'busqueda', CARGA: 'carga' };

export default function NuevaCargaModal({ isOpen, onClose, onSuccess }) {
  const { theme } = useTheme();

  const [step, setStep] = useState(STEPS.BUSQUEDA);

  // Step 1
  const [numeroExp, setNumeroExp] = useState('');
  const [tipo, setTipo] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  // Step 2 — resultado de búsqueda
  const [resultado, setResultado] = useState(null); // { existe, padron, padronSimulado, expediente }

  // Step 2 — carga
  const [descripcion, setDescripcion] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');

  const reset = () => {
    setStep(STEPS.BUSQUEDA);
    setNumeroExp('');
    setTipo('');
    setResultado(null);
    setDescripcion('');
    setArchivos([]);
    setErrorBusqueda('');
    setErrorCarga('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── Step 1: buscar expediente ──────────────────────────────────────────────
  const handleBuscar = async () => {
    setErrorBusqueda('');
    if (!EXPEDIENTE_REGEX.test(numeroExp)) {
      setErrorBusqueda('Formato inválido. Ejemplo: 2024-E-12345');
      return;
    }
    if (!tipo) {
      setErrorBusqueda('Seleccioná el tipo de plano');
      return;
    }
    setBuscando(true);
    try {
      const res = await buscarExpediente(numeroExp);
      setResultado(res.data.data);
      setStep(STEPS.CARGA);
    } catch (err) {
      setErrorBusqueda(err.response?.data?.message || 'Error al buscar expediente');
    } finally {
      setBuscando(false);
    }
  };

  // ── Step 2: subir ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setErrorCarga('');
    if (archivos.length === 0) { setErrorCarga('Seleccioná al menos un archivo PDF'); return; }

    const padronNumero = resultado.existe
      ? resultado.padron.numero
      : resultado.padronSimulado;

    const formData = new FormData();
    formData.append('numeroExpediente', numeroExp);
    formData.append('tipo', tipo);
    formData.append('padronNumero', padronNumero);
    archivos.forEach((f) => formData.append('pdf', f));
    if (descripcion.trim()) formData.append('descripcion', descripcion.trim());

    setSubiendo(true);
    try {
      const res = await cargaInicial(formData);
      onSuccess?.(res.data.data);
      handleClose();
    } catch (err) {
      setErrorCarga(err.response?.data?.message || 'Error al subir el plano');
    } finally {
      setSubiendo(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf');
    if (dropped.length > 0) setArchivos((prev) => [...prev, ...dropped]);
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.text,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: theme.textSecondary,
    marginBottom: '6px',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  };

  const tipoSeleccionado = TIPOS.find((t) => t.value === tipo);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva carga de plano"
      maxWidth="480px"
    >
      {/* Stepper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        {[
          { key: STEPS.BUSQUEDA, label: 'Expediente' },
          { key: STEPS.CARGA,    label: 'Cargar plano' },
        ].map((s, i, arr) => (
          <React.Fragment key={s.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: step === s.key || (s.key === STEPS.BUSQUEDA && step === STEPS.CARGA)
                    ? theme.accent
                    : theme.border,
                  color: step === s.key || (s.key === STEPS.BUSQUEDA && step === STEPS.CARGA)
                    ? '#fff'
                    : theme.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                {s.key === STEPS.BUSQUEDA && step === STEPS.CARGA ? '✓' : i + 1}
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: step === s.key ? 600 : 400,
                  color: step === s.key ? theme.text : theme.textMuted,
                }}
              >
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: step === STEPS.CARGA ? theme.accent : theme.border,
                  transition: 'background 0.3s',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Búsqueda ── */}
      {step === STEPS.BUSQUEDA && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Número de expediente</label>
            <input
              type="text"
              value={numeroExp}
              onChange={(e) => setNumeroExp(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              placeholder="2024-E-12345 / 2024-E1-12345"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = theme.accent)}
              onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
            />
            <p style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
              Formato: AÑO-TIPO-NÚMERO &nbsp;·&nbsp; Tipos válidos: E, E1, E2 &nbsp;(ej. 2024-E2-12345)
            </p>
          </div>

          <div>
            <label style={labelStyle}>Tipo de plano</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTipo(t.value)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: `2px solid ${tipo === t.value ? theme.accent : theme.border}`,
                    background: tipo === t.value ? theme.accentLight : theme.inputBg,
                    color: tipo === t.value ? theme.accent : theme.text,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{t.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorBusqueda && (
            <p
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
              }}
            >
              {errorBusqueda}
            </p>
          )}

          <Button onClick={handleBuscar} loading={buscando} fullWidth>
            Buscar expediente →
          </Button>
        </div>
      )}

      {/* ── STEP 2: Carga ── */}
      {step === STEPS.CARGA && resultado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Info del expediente / padrón encontrado */}
          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: theme.mainBg,
              border: `1px solid ${theme.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Expediente
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: resultado.existe ? theme.statusPreAprobado.bg : theme.statusPresentado.bg,
                  color: resultado.existe ? theme.statusPreAprobado.text : theme.statusPresentado.text,
                  border: `1px solid ${resultado.existe ? theme.statusPreAprobado.border : theme.statusPresentado.border}`,
                  fontWeight: 600,
                }}
              >
                {resultado.existe ? 'Existente' : 'Nuevo'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>Número</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>{numeroExp}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>Tipo de plano</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>
                  {tipoSeleccionado?.icon} {tipoSeleccionado?.label}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: theme.textMuted }}>
                Padrón {resultado.existe ? '' : '(simulado)'}
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: theme.accent,
                  letterSpacing: '0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                #{resultado.existe ? resultado.padron?.numero : resultado.padronSimulado}
              </div>
            </div>
          </div>

          {/* Descripción (opcional) */}
          <div>
            <label style={labelStyle}>
              Descripción&nbsp;
              <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '11px' }}>(opcional)</span>
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción del plano..."
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = theme.accent)}
              onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
            />
          </div>

          {/* PDF upload con drag & drop — múltiples archivos */}
          <div>
            <label style={labelStyle}>
              Archivos PDF *{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '11px' }}>
                (podés seleccionar o arrastrar varios)
              </span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('nueva-carga-pdf').click()}
              style={{
                border: `2px dashed ${dragOver ? theme.accent : archivos.length > 0 ? theme.accent : theme.border}`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                background: dragOver || archivos.length > 0 ? theme.accentLight : theme.inputBg,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <input
                id="nueva-carga-pdf"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => setArchivos((prev) => [...prev, ...Array.from(e.target.files)])}
              />
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                {archivos.length > 0 ? '✅' : '📄'}
              </div>
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                {archivos.length > 0
                  ? `${archivos.length} archivo${archivos.length !== 1 ? 's' : ''} seleccionado${archivos.length !== 1 ? 's' : ''} · Clic para agregar más`
                  : 'Arrastrá PDFs aquí o hacé clic para seleccionar'}
              </div>
              {archivos.length === 0 && (
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
                  Máximo 50 MB por archivo
                </div>
              )}
            </div>

            {/* Lista de archivos seleccionados */}
            {archivos.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {archivos.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 10px', borderRadius: '7px',
                    background: theme.inputBg, border: `1px solid ${theme.border}`,
                    fontSize: '12px', color: theme.textSecondary,
                  }}>
                    <span>📄</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ color: theme.textMuted, flexShrink: 0 }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setArchivos((prev) => prev.filter((_, j) => j !== i)); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '13px', lineHeight: 1, padding: '0 2px' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorCarga && (
            <p
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
              }}
            >
              {errorCarga}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="secondary"
              onClick={() => setStep(STEPS.BUSQUEDA)}
              disabled={subiendo}
            >
              ← Volver
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              loading={subiendo}
              disabled={archivos.length === 0}
            >
              {subiendo ? 'Subiendo...' : 'Cargar plano'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
