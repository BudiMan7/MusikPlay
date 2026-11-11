import React from 'react';

interface GlassBottomBarProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassBottomBar: React.FC<GlassBottomBarProps> = ({
  children,
  className = '',
}) => {
  return (
    <nav
      aria-label="Main Navigation"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md h-16 rounded-[32px] liquid-glass flex items-center justify-around px-3 shadow-2xl ${className}`}
    >
      {children}
    </nav>
  );
};
