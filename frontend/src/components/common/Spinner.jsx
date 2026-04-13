import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Spinner({ size = 24, color }) {
  const { theme } = useTheme();
  const c = color || theme.accent;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2.5" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
