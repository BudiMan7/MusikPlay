import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'normal' | 'subtle' | 'glow';
  accentColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'normal',
  accentColor,
  style,
  ...props
}) => {
  const baseClasses =
    variant === 'subtle'
      ? 'liquid-glass-subtle rounded-[26px] p-5 transition-all duration-200'
      : 'liquid-glass rounded-[26px] p-5 transition-all duration-200';

  const glowStyle =
    variant === 'glow' && accentColor
      ? { boxShadow: `0 12px 36px -8px ${accentColor}33`, borderColor: `${accentColor}44` }
      : {};

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{ ...glowStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
