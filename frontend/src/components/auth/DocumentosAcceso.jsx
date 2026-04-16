import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

import codigoImg from '../../../iconos/codigo de edificacion.png';
import manualImg from '../../../iconos/manual de usuario.png';
import rotulosImg from '../../../iconos/rotulos de planos.png';
import zonificacionImg from '../../../iconos/zonificacion.png';

import codigoPdf from '../../../archivos/codigo-edificacion-godoy-cruz.pdf?url';
import manualPdf from '../../../archivos/Manual-de-Usuario--Sistema-de-Carga-de-Planos.pdf?url';
import zonificacionPdf from '../../../archivos/zonificacion.pdf?url';
import caraturasZip from '../../../archivos/caratulas.zip?url';

const DOCS = [
  {
    id: 'codigo',
    label: 'Código de\nEdificación',
    img: codigoImg,
    type: 'pdf',
    src: codigoPdf,
    title: 'Código de Edificación — Godoy Cruz',
  },
  {
    id: 'manual',
    label: 'Manual de\nUsuario',
    img: manualImg,
    type: 'pdf',
    src: manualPdf,
    title: 'Manual de Usuario — Sistema de Carga de Planos',
  },
  {
    id: 'rotulos',
    label: 'Rótulos de\nPlanos',
    img: rotulosImg,
    type: 'zip',
    src: caraturasZip,
    filename: 'caratulas.zip',
  },
  {
    id: 'zonificacion',
    label: 'Zonificación',
    img: zonificacionImg,
    type: 'pdf',
    src: zonificacionPdf,
    title: 'Zonificación — Godoy Cruz',
  },
];

export default function DocumentosAcceso() {
  const { theme } = useTheme();
  const [viewer, setViewer] = useState(null); // { src, title } | null
  const [hoveredId, setHoveredId] = useState(null);

  const handleClick = (doc) => {
    if (doc.type === 'zip') {
      const a = document.createElement('a');
      a.href = doc.src;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      setViewer({ src: doc.src, title: doc.title });
    }
  };

  return (
    <>
      {/* Separador */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '28px 0 18px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: theme.border }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Recursos municipales
        </span>
        <div style={{ flex: 1, height: '1px', background: theme.border }} />
      </div>

      {/* Grid de botones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {DOCS.map((doc) => {
          const isHovered = hoveredId === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => handleClick(doc)}
              onMouseEnter={() => setHoveredId(doc.id)}
              onMouseLeave={() => setHoveredId(null)}
              title={doc.type === 'zip' ? `Descargar ${doc.filename}` : doc.title}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 6px 10px',
                borderRadius: '12px',
                border: `1.5px solid ${isHovered ? '#7c3aed' : theme.border}`,
                background: isHovered ? (theme.mainBg) : theme.contentBg,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s, transform 0.1s, box-shadow 0.15s',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered ? '0 4px 12px rgba(124,58,237,0.15)' : theme.shadow,
              }}
            >
              {/* Ícono ZIP */}
              {doc.type === 'zip' && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  ZIP
                </span>
              )}
              {doc.type === 'pdf' && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  PDF
                </span>
              )}

              {/* Imagen */}
              <img
                src={doc.img}
                alt={doc.label}
                style={{
                  width: '52px',
                  height: '52px',
                  objectFit: 'contain',
                  transition: 'transform 0.1s',
                  transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                }}
              />

              {/* Label */}
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 500,
                  color: isHovered ? '#7c3aed' : theme.textSecondary,
                  textAlign: 'center',
                  lineHeight: 1.35,
                  whiteSpace: 'pre-line',
                  transition: 'color 0.15s',
                }}
              >
                {doc.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modal visor PDF */}
      {viewer && (
        <div
          onClick={() => setViewer(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(3px)',
          }}
        >
          {/* Barra superior */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              background: theme.contentBg,
              borderBottom: `1px solid ${theme.border}`,
              gap: '16px',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: theme.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {viewer.title}
            </span>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <a
                href={viewer.src}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: theme.mainBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textSecondary,
                  fontSize: '12.5px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                ↗ Nueva pestaña
              </a>
              <button
                onClick={() => setViewer(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: theme.mainBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textSecondary,
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          {/* iframe */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, overflow: 'hidden' }}
          >
            <iframe
              src={viewer.src}
              title={viewer.title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
