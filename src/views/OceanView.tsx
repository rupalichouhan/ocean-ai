import React from 'react';
import {
  Compass,
  Award,
  Sparkles,
  Shield,
  Moon,
  Waves,
  Bookmark,
  CheckCircle2,
  Lock,
  Info
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { OceanProgress, OceanStageInfo } from '../types';

interface OceanViewProps {
  oceanProgress: OceanProgress | null;
}

const STAGES: OceanStageInfo[] = [
  {
    id: 'shallows',
    name: 'Shallows',
    depth: '0 - 50m',
    minXp: 0,
    description: 'Sunlit waters rich with curiosity and initial conversations.',
    themeColor: 'from-cyan-400 to-teal-500'
  },
  {
    id: 'coral_garden',
    name: 'Coral Garden',
    depth: '50 - 200m',
    minXp: 100,
    description: 'Vibrant reefs where personalized preferences and memories take root.',
    themeColor: 'from-teal-400 to-emerald-500'
  },
  {
    id: 'open_sea',
    name: 'Open Sea',
    depth: '200 - 1,000m',
    minXp: 250,
    description: 'Vast oceanic expanse for expansive inquiries, science, and coding.',
    themeColor: 'from-teal-500 to-blue-600'
  },
  {
    id: 'deep_water',
    name: 'Deep Water',
    depth: '1,000 - 3,000m',
    minXp: 500,
    description: 'The bathyal depths of multi-perspective reasoning and complex analysis.',
    themeColor: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'midnight_zone',
    name: 'Midnight Zone',
    depth: '3,000 - 6,000m',
    minXp: 1000,
    description: 'Complete abyss illuminated solely by bioluminescent intelligence.',
    themeColor: 'from-indigo-600 to-purple-800'
  },
  {
    id: 'bioluminescent_trench',
    name: 'Bioluminescent Trench',
    depth: '6,000m+',
    minXp: 2000,
    description: 'The hadal realm of profound mastery and symbiotic companionship.',
    themeColor: 'from-cyan-300 via-teal-400 to-indigo-900'
  }
];

export const OceanView: React.FC<OceanViewProps> = ({ oceanProgress }) => {
  const currentXp = oceanProgress?.xp || 0;
  const currentLevel = oceanProgress?.level || 1;

  const achievementIcons: Record<string, any> = {
    Compass,
    Waves,
    Sparkles,
    Bookmark,
    Shield,
    Moon
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <GlassCard className="p-8 border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-2">
              <Compass size={14} className="text-slate-600" />
              <span>Depth Exploration Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Ocean Progression: <span className="text-slate-700">{oceanProgress?.currentStage || 'Shallows'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Every meaningful turn, saved memory, and exploration awards Ocean XP, enabling deeper descents through marine zones.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex-shrink-0">
            <div>
              <div className="text-2xl font-bold text-slate-900">{currentXp}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total XP</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-2xl font-bold text-slate-900">Level {currentLevel}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Tier</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Ocean Depth Journey Roadmap */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Waves size={16} className="text-slate-700" />
          <span>Ocean Depth Roadmap</span>
        </h3>

        <div className="space-y-3 relative">
          {STAGES.map((stage) => {
            const isUnlocked = currentXp >= stage.minXp;
            const isCurrent = (oceanProgress?.currentStage || 'Shallows') === stage.name;

            return (
              <GlassCard
                key={stage.id}
                className={`p-5 transition-all duration-300 ${
                  isCurrent
                    ? 'border-slate-400 bg-slate-50/80 shadow-xs'
                    : isUnlocked
                    ? 'border-slate-200'
                    : 'opacity-60 border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        isUnlocked
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={16} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{stage.name}</h4>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {stage.depth}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stage.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 self-end sm:self-center">
                    <span className="text-xs font-semibold text-slate-800">
                      {stage.minXp} XP required
                    </span>
                    <div className="text-[11px] text-slate-500">
                      {isUnlocked ? 'Stage Discovered' : `${stage.minXp - currentXp} XP remaining`}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Award size={16} className="text-slate-700" />
          <span>Ocean Achievements ({oceanProgress?.achievements.filter((a) => a.unlocked).length || 0}/6)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(oceanProgress?.achievements || []).map((ach) => {
            const Icon = achievementIcons[ach.iconName] || Award;
            return (
              <GlassCard
                key={ach.id}
                className={`p-5 transition-all ${
                  ach.unlocked
                    ? 'border-slate-200 shadow-xs'
                    : 'opacity-50 border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      ach.unlocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-900'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{ach.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{ach.description}</p>
                    {ach.unlocked && (
                      <div className="text-[10px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Unlocked</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Ethical Gamification Notice */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-3 text-xs text-slate-600 shadow-xs">
        <Info size={16} className="text-slate-500 flex-shrink-0" />
        <span>
          Progression in Buddy represents depth of exploration and milestones, crafted deliberately without dark patterns or streak penalties.
        </span>
      </div>
    </div>
  );
};

