import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  variant?: 'glass' | 'solid' | 'ghost';
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  children,
  icon,
  'aria-label': ariaLabel,
  size = 'md',
  active = false,
  variant = 'glass',
  className = '',
  style,
  ...props
}) => {
  const { effectiveAccent, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-9 h-9 min-w-[36px]',
    md: 'w-11 h-11 min-w-[44px]',
    lg: 'w-13 h-13 min-w-[52px]',
  }[size];

  let variantClasses = '';
  let customStyle: React.CSSProperties = {};

  if (variant === 'glass') {
    variantClasses = 'liquid-glass-subtle text-slate-800 dark:text-slate-100 hover:border-white/40 active:scale-95';
    if (active) {
      customStyle = {
        borderColor: effectiveAccent,
        color: effectiveAccent,
        boxShadow: `0 0 16px ${effectiveAccent}40`,
      };
    }
  } else if (variant === 'solid') {
    customStyle = {
      backgroundColor: effectiveAccent,
      color: isDark ? '#000000' : '#FFFFFF',
      boxShadow: `0 4px 16px ${effectiveAccent}40`,
    };
    variantClasses = 'active:scale-95';
  } else {
    variantClasses = 'hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-slate-600 dark:text-slate-300';
    if (active) {
      customStyle = { color: effectiveAccent };
    }
  }

  return (
    <button
      aria-label={ariaLabel}
      className={`rounded-full flex items-center justify-center transition-all cursor-pointer select-none shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
      style={{ ...customStyle, ...style }}
      {...props}
    >
      {icon || children}
    </button>
  );
};
