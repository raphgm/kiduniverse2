import React from 'react';
import { ChildProfile } from '../types';
import { ArchitectureState } from '../services/authSimulator';
import { Rocket, BookOpen, Palette, ArrowRight, Activity, Terminal } from 'lucide-react';

interface HeroBannerProps {
  currentChild: ChildProfile;
  onSelectTab: (tab: 'stories' | 'math' | 'doodle' | 'trophies') => void;
  onOpenLabDrawer: () => void;
  archState: ArchitectureState;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentChild,
  onSelectTab,
  onOpenLabDrawer,
  archState,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-slate-200 py-10 sm:py-14">
      {/* Decorative cosmic background geometric shapes */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 translate-y-16 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Greeting, Action CTA, and Metadata */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Context kicker: Lab integration note */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-indigo-600 font-semibold">SKILL.SCH Cloud Lab Workload</span>
              <span aria-hidden="true">·</span>
              <span>Monolith Service Extraction on Azure</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-700">Azure AKS & APIM Strangler Fig</span>
            </div>

            {/* Main Headline with text-wrap: balance */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-display leading-[1.15] text-balance">
              Welcome back, <span className="text-indigo-600">{currentChild.name}</span>! Ready for a cosmic adventure?
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Explore interactive storybooks, calculate rocket trajectories on Math Planet, and paint starlit masterpieces in your doodle studio.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('stories')}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Story Explorer</span>
              </button>

              <button
                onClick={() => onSelectTab('math')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 hover:bg-slate-50"
              >
                <Rocket className="w-4 h-4 text-rose-500" />
                <span>Math Rocket Challenge</span>
              </button>

              <button
                onClick={() => onSelectTab('doodle')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>Doodle Pad</span>
              </button>
            </div>

            {/* Child Profile Stats strip (Zero pills: unboxed clean text) */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="text-base">{currentChild.avatar}</span>
                <span>{currentChild.favoriteAnimal}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span>Age </span>
                <span className="font-semibold text-slate-800 tabular-nums">{currentChild.age} yrs</span>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span>Starlight Balance: </span>
                <span className="font-semibold text-amber-600 tabular-nums">{currentChild.stars} Stars</span>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span>Badges: </span>
                <span className="font-semibold text-slate-800 tabular-nums">{currentChild.badges.length} Unlocked</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Cloud Lab Architectural Status Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${archState.mode === 'extracted' ? 'bg-sky-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                    Azure Lab Architecture
                  </span>
                </div>
                <button
                  onClick={onOpenLabDrawer}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <span>Open Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mode indicator */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Active Routing Engine:</span>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    archState.mode === 'extracted' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {archState.mode === 'extracted' ? 'Azure APIM + AKS Microservice' : 'All-in-One Legacy Monolith'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Canary Split to AKS Auth:</span>
                  <span className="font-semibold text-slate-800 font-mono tabular-nums">
                    {archState.mode === 'extracted' ? `${archState.canaryPercent}%` : '0% (Disabled)'}
                  </span>
                </div>

                {/* Progress visualizer */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-sky-500 transition-all duration-300"
                    style={{ width: `${archState.mode === 'extracted' ? archState.canaryPercent : 0}%` }}
                    title={`AKS Auth: ${archState.canaryPercent}%`}
                  />
                  <div
                    className="bg-amber-400 transition-all duration-300"
                    style={{ width: `${archState.mode === 'extracted' ? 100 - archState.canaryPercent : 100}%` }}
                    title="Legacy Monolith Traffic"
                  />
                </div>
              </div>

              {/* Quick stats and action */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="text-slate-400 font-medium">Monolith Requests</div>
                  <div className="text-base font-bold text-slate-800 font-mono tabular-nums">
                    {archState.totalRequestsHandled.monolith}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="text-slate-400 font-medium">AKS Auth Requests</div>
                  <div className="text-base font-bold text-sky-600 font-mono tabular-nums">
                    {archState.totalRequestsHandled.aks}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Key Vault: Bound (CSI)</span>
                </div>
                <button
                  onClick={onOpenLabDrawer}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect JWT Wiretap</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
