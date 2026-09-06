import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive
}) => {
  return (
    <GlassCard className="p-5 flex flex-col justify-between hover:border-slate-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
          <Icon size={16} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-light text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-2 text-[11px]">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                trendPositive
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  : 'text-slate-600 bg-slate-100'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

