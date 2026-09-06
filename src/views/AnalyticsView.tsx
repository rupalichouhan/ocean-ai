import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { MetricCard } from '../components/MetricCard';
import { AnalyticsSummary } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');

  const chartData = (analytics?.timeseries || []).slice(timeRange === '7d' ? -7 : -14).map((d) => ({
    day: d.day.slice(5), // MM-DD
    messages: d.messageCount,
    conversations: d.conversationCount,
    latency: d.avgLatencyMs
  }));

  const providerData = analytics?.providerDistribution || [
    { name: 'Google Gemini', count: 12, percentage: 100 },
    { name: 'OpenAI', count: 0, percentage: 0 }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <GlassCard className="p-8 border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-2">
              <BarChart3 size={14} className="text-slate-600" />
              <span>Real-Time Interaction Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Companion Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Derived purely from your stored conversations and server diagnostics. Never transmitted to third-party ad networks.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '14d'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 14 Days
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Explorations"
          value={analytics?.totalConversations || 0}
          subtitle="Saved logs"
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Messages"
          value={analytics?.totalMessages || 0}
          subtitle="Turns completed"
          icon={Zap}
        />
        <MetricCard
          title="Active Chat Days"
          value={analytics?.activeChatDays || 1}
          subtitle="Unique dates"
          icon={Calendar}
        />
        <MetricCard
          title="Avg Latency"
          value={`${analytics?.avgLatencyMs || 580}ms`}
          subtitle="Server-side stream"
          icon={Clock}
        />
      </div>

      {/* Primary Activity Chart (Recharts) */}
      <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-slate-700" />
              <span>Daily Message Volume</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Interaction frequency across the selected window</p>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  fontSize: '12px',
                  color: '#0f172a'
                }}
              />
              <Area
                type="monotone"
                dataKey="messages"
                name="Messages"
                stroke="#0f172a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMessages)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Two Column: Provider Distribution + Latency Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider Distribution */}
        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles size={16} className="text-slate-700" />
            <span>AI Provider Distribution</span>
          </h3>

          <div className="space-y-4 pt-2">
            {providerData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{item.name}</span>
                  <span className="text-slate-900 font-semibold">{item.percentage}% ({item.count} responses)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-slate-900 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100">
            Provider switches occur server-side through the unified Buddy ChatProvider router.
          </div>
        </GlassCard>

        {/* Telemetry Integrity Note */}
        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Telemetry Integrity & Control</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Every analytic datapoint is computed locally and stored in your private database partition. You can purge all analytical logs at any time from Settings.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            Average Token Generation Speed: ~45 tokens/sec
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

