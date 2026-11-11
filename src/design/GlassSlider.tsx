import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface GlassSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  displayValue?: string;
  vertical?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  displayValue,
  vertical = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const { effectiveAccent } = useTheme();
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  if (vertical) {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        {label && <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2 truncate max-w-[48px] text-center">{label}</span>}
        <div className="relative h-44 w-10 flex items-center justify-center">
          {/* Glass track */}
          <div className="absolute w-2.5 h-full rounded-full bg-slate-300/40 dark:bg-white/10 backdrop-blur-md overflow-hidden border border-white/20">
            <div
              className="absolute bottom-0 w-full rounded-full transition-all duration-75"
              style={{ height: `${percentage}%`, backgroundColor: effectiveAccent }}
            />
          </div>
          {/* Native range input positioned invisibly over the track */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            aria-label={ariaLabel || label || 'Slider'}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer h-full w-full -rotate-90"
          />
          {/* Draggable Glass Thumb Indicator */}
          <div
            className="absolute w-6 h-6 rounded-full shadow-md border border-white/80 dark:border-white/40 pointer-events-none transition-all duration-75 flex items-center justify-center"
            style={{
              bottom: `calc(${percentage}% - 12px)`,
              backgroundColor: '#FFFFFF',
              boxShadow: `0 2px 8px ${effectiveAccent}40`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: effectiveAccent }} />
          </div>
        </div>
        {displayValue && (
          <span className="text-[11px] font-mono tabular-nums text-slate-700 dark:text-slate-300 mt-2 font-medium">
            {displayValue}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full select-none ${className}`}>
      {(label || displayValue) && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          {label && <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {displayValue && (
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <div className="relative h-6 flex items-center">
        {/* Track */}
        <div className="w-full h-2 rounded-full bg-slate-300/40 dark:bg-white/10 backdrop-blur-md overflow-hidden border border-white/20">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{ width: `${percentage}%`, backgroundColor: effectiveAccent }}
          />
        </div>
        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel || label || 'Slider'}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        {/* Thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-md border border-white/80 pointer-events-none transition-all duration-75 -ml-2"
          style={{
            left: `${percentage}%`,
            boxShadow: `0 2px 8px ${effectiveAccent}50`,
          }}
        />
      </div>
    </div>
  );
};
