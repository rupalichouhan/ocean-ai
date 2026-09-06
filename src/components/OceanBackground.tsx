import React from 'react';

interface OceanBackgroundProps {
  reducedMotion?: boolean;
  variant?: 'surface' | 'mid' | 'abyss' | 'chat';
}

export const OceanBackground: React.FC<OceanBackgroundProps> = ({
  reducedMotion = false,
  variant = 'mid'
}) => {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none bg-[#F8FAFC]"
      aria-hidden="true"
    >
      {/* Crisp Subtle Minimalist Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

      {/* Gentle Subtle Light Gradient */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[400px] bg-gradient-to-b from-slate-200/40 via-cyan-100/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-20 right-1/4 w-[500px] h-[400px] bg-gradient-to-t from-slate-200/30 via-teal-100/15 to-transparent blur-3xl" />

      {/* Bottom subtle divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" />
    </div>
  );
};

