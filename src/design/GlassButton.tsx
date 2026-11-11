import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'glass' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const { effectiveAccent, isDark } = useTheme();

  const sizeClasses = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-13 px-6 text-base gap-2.5',
  }[size];

  let variantStyles: React.CSSProperties = {};
  let variantClasses = '';

  if (variant === 'primary') {
    variantStyles = {
      backgroundColor: effectiveAccent,
      color: isDark ? '#000000' : '#FFFFFF',
      boxShadow: `0 4px 18px 0 ${effectiveAccent}40`,
    };
    variantClasses = 'font-semibold active:scale-[0.98] transition-transform';
  } else if (variant === 'glass') {
    variantClasses = 'liquid-glass font-medium text-slate-800 dark:text-slate-100 hover:bg-white/10 active:scale-[0.98] transition-all';
  } else {
    variantClasses = 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors';
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={{ ...variantStyles, ...style }}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
