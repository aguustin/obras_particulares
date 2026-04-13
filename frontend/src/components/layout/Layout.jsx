import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const { theme } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.mainBg }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
