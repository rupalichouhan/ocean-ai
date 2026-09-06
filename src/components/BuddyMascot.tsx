import React from 'react';
import { MascotState } from '../types';

interface BuddyMascotProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const BuddyMascot: React.FC<BuddyMascotProps> = ({
  state = 'idle',
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    hero: 'w-28 h-28 md:w-36 md:h-36'
  };

  const auraMap: Record<MascotState, string> = {
    idle: 'bg-slate-200/50',
    listening: 'bg-emerald-100/70',
    thinking: 'bg-slate-200/80 animate-pulse',
    streaming: 'bg-cyan-100/80',
    success: 'bg-emerald-100/80',
    error: 'bg-rose-100/70'
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
      role="img"
      aria-label={`Buddy companion mascot (${state})`}
    >
      {/* Outer Subtle Aura */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${auraMap[state]}`}
      />

      {/* Main Creature SVG */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full transform transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id={`buddyCore-${state}`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            {state === 'idle' && (
              <>
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#334155" />
              </>
            )}
            {state === 'thinking' && (
              <>
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#475569" />
              </>
            )}
            {state === 'streaming' && (
              <>
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#0f172a" />
              </>
            )}
            {state === 'success' && (
              <>
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#0f172a" />
              </>
            )}
            {state === 'listening' && (
              <>
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#0f172a" />
              </>
            )}
            {state === 'error' && (
              <>
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#991b1b" />
              </>
            )}
          </linearGradient>

          <radialGradient id="buddyGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Jelly/Bell Creature Dome */}
        <path
          d="M20 54C20 32 33 16 50 16C67 16 80 32 80 54C80 62 74 65 67 63C60 61 56 65 50 65C44 65 40 61 33 63C26 65 20 62 20 54Z"
          fill={`url(#buddyCore-${state})`}
          className="transition-all duration-300"
        />

        {/* Light Dome Highlight */}
        <path
          d="M28 42C28 28 38 20 50 20C62 20 72 28 72 42C64 35 57 32 50 32C43 32 36 35 28 42Z"
          fill="url(#buddyGlow)"
          opacity="0.8"
        />

        {/* Clean Trailing Tentacles */}
        <path
          d="M32 64C30 74 34 82 31 88"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M44 66C45 76 41 84 44 92"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M56 66C55 76 59 84 56 92"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M68 64C70 74 66 82 69 88"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Expressive Friendly Eyes */}
        <circle cx="41" cy="45" r="3.5" fill="#ffffff" />
        <circle cx="59" cy="45" r="3.5" fill="#ffffff" />
        <circle cx="41.5" cy="44.8" r="1.5" fill="#0f172a" />
        <circle cx="59.5" cy="44.8" r="1.5" fill="#0f172a" />

        {/* Sparkle Dots */}
        <circle cx="50" cy="34" r="1.5" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
};

