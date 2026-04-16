import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { useDebounce } from '../hooks/useDebounce';
import Layout from '../components/layout/Layout';
import PadronCard from '../components/padron/PadronCard';
import PlanoDetail from '../components/plano/PlanoDetail';
import NuevaCargaModal from '../components/plano/NuevaCargaModal';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { getDashboard } from '../services/planoService';

const PAGE_SIZE = 15;

export default function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { filters } = useFilters();
  const debouncedSearch = useDebounce(filters.search, 400);

  const [padrones, setPadrones] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nuevaCargaOpen, setNuevaCargaOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(filters.estado && { estado: filters.estado }),
        ...(filters.pendiente !== null && filters.pendiente !== undefined && { pendiente: filters.pendiente }),
        ...(debouncedSearch && { search: debouncedSearch, searchBy: filters.searchBy }),
      };
      const res = await getDashboard(params);
      setPadrones(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
      setPages(res.data.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [filters.estado, filters.pendiente, filters.searchBy, debouncedSearch, page, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [filters.estado, filters.pendiente, filters.searchBy, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlanoClick = (plano, expedienteUsuariosAutorizados) => {
    setSelectedPlano((prev) =>
      prev?._id === plano._id
        ? null
        : { ...plano, _usuariosAutorizados: expedienteUsuariosAutorizados || [] }
    );
  };

  const handlePlanoUpdate = () => {
    setRefreshKey((k) => k + 1);
  };

  const handlePlanoDelete = () => {
    setSelectedPlano(null);
    setRefreshKey((k) => k + 1);
  };

  const handlePadronDelete = () => {
    setSelectedPlano(null);
    setRefreshKey((k) => k + 1);
  };

  const filterLabel = () => {
    if (!filters.estado) return 'Todos los planos';
    const labels = {
      PRESENTADO: 'Presentados',
      EN_PROGRESO: 'En Progreso',
      OBSERVADOS: 'Observados',
      PRE_APROBADO: 'Pre-Aprobados',
    };
    const base = labels[filters.estado] || filters.estado;
    if (filters.pendiente === true) return `${base} — Pendientes`;
    if (filters.pendiente === false) return `${base} — No pendientes`;
    return base;
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh' }}>
        {/* Main list */}
        <div
          style={{
            flex: selectedPlano ? '0 0 55%' : '1',
            overflowY: 'auto',
            padding: '24px',
            transition: 'flex 0.3s ease',
          }}
        >
          {/* Page header */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: theme.text }}>
                {filterLabel()}
              </h1>
              <p style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>
                {loading ? 'Cargando...' : `${total} resultado${total !== 1 ? 's' : ''}`}
                {filters.search && ` · Búsqueda: "${filters.search}"`}
              </p>
            </div>

            {user?.rol === 'PROFESIONAL' && (
              <Button onClick={() => setNuevaCargaOpen(true)} size="sm">
                + Nueva carga
              </Button>
            )}
          </div>

          <NuevaCargaModal
            isOpen={nuevaCargaOpen}
            onClose={() => setNuevaCargaOpen(false)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <Spinner size={36} />
            </div>
          )}

          {/* Empty */}
          {!loading && padrones.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                color: theme.textMuted,
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.textSecondary }}>
                Sin resultados
              </h3>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                No hay padrones que coincidan con el filtro actual.
              </p>
            </div>
          )}

          {/* Padrones list */}
          {!loading && padrones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {padrones.map((padron) => (
                <PadronCard
                  key={padron._id}
                  padron={padron}
                  expedientes={padron.expedientes || []}
                  onPlanoClick={handlePlanoClick}
                  selectedPlanoId={selectedPlano?._id}
                  onDelete={handlePadronDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '24px',
                paddingBottom: '24px',
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  background: theme.contentBg,
                  color: theme.text,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.5 : 1,
                  fontSize: '13px',
                }}
              >
                ← Anterior
              </button>

              {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${page === p ? theme.accent : theme.border}`,
                      background: page === p ? theme.accent : theme.contentBg,
                      color: page === p ? '#fff' : theme.text,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: page === p ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  background: theme.contentBg,
                  color: theme.text,
                  cursor: page >= pages ? 'not-allowed' : 'pointer',
                  opacity: page >= pages ? 0.5 : 1,
                  fontSize: '13px',
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* Plano Detail panel */}
        {selectedPlano && (
          <div
            style={{
              flex: '0 0 45%',
              borderLeft: `1px solid ${theme.border}`,
              overflowY: 'auto',
              background: theme.contentBg,
              minWidth: 0,
            }}
          >
            <PlanoDetail
              plano={selectedPlano}
              onClose={() => setSelectedPlano(null)}
              onUpdate={handlePlanoUpdate}
              onDelete={handlePlanoDelete}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
