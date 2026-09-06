import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  interactive = false,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl bg-white border border-slate-200 ${
        interactive
          ? 'cursor-pointer hover:bg-slate-50/70 hover:border-slate-300 transition-all duration-150 shadow-xs hover:shadow-sm'
          : 'shadow-xs'
      } ${glow ? 'ring-1 ring-slate-300' : ''} p-6 transition-all duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

