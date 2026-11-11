import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  'aria-label'?: string;
}

export const GlassToggle: React.FC<GlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const { effectiveAccent } = useTheme();

  return (
    <label
      className={`flex items-center justify-between cursor-pointer select-none py-2 gap-4 ${className}`}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          aria-label={ariaLabel || label || 'Toggle'}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-12 h-6.5 rounded-full transition-colors duration-200 border border-white/20 backdrop-blur-md ${
            checked ? '' : 'bg-slate-300/60 dark:bg-white/10'
          }`}
          style={{
            backgroundColor: checked ? effectiveAccent : undefined,
          }}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 mt-[2px] ${
              checked ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </label>
  );
};
