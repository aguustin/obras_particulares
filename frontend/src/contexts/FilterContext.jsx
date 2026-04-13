import React, { createContext, useContext, useState, useCallback } from 'react';

const FilterContext = createContext(null);

const initialFilters = {
  estado: null,       // 'PRESENTADO' | 'EN_PROGRESO' | 'OBSERVADOS' | 'PRE_APROBADO'
  pendiente: null,    // true | false | null (all)
  searchBy: 'padron', // 'padron' | 'expediente'
  search: '',
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);

  const setEstado = useCallback((estado, pendiente = null) => {
    setFilters((f) => ({ ...f, estado, pendiente }));
  }, []);

  const setSearch = useCallback((search) => {
    setFilters((f) => ({ ...f, search }));
  }, []);

  const setSearchBy = useCallback((searchBy) => {
    setFilters((f) => ({ ...f, searchBy, search: '' }));
  }, []);

  const setPendiente = useCallback((pendiente) => {
    setFilters((f) => ({ ...f, pendiente }));
  }, []);

  const reset = useCallback(() => setFilters(initialFilters), []);

  return (
    <FilterContext.Provider value={{ filters, setEstado, setSearch, setSearchBy, setPendiente, reset }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider');
  return ctx;
};
