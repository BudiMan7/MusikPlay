import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface GlassPresetCardProps {
  title: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const GlassPresetCard: React.FC<GlassPresetCardProps> = ({
  title,
  isSelected,
  onClick,
  className = '',
}) => {
  const { effectiveAccent } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-[14px] text-xs font-medium cursor-pointer transition-all duration-150 active:scale-95 border select-none ${
        isSelected
          ? 'shadow-sm text-slate-900 dark:text-white font-semibold'
          : 'bg-white/40 dark:bg-white/5 border-white/20 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10'
      } ${className}`}
      style={
        isSelected
          ? {
              backgroundColor: `${effectiveAccent}25`,
              borderColor: effectiveAccent,
              boxShadow: `0 0 14px ${effectiveAccent}30`,
            }
          : undefined
      }
    >
      {title}
    </button>
  );
};
