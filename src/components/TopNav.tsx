import React from 'react';
import { ChildProfile, ParentUser } from '../types';
import { ArchitectureState } from '../services/authSimulator';
import { Cloud, Server, Sparkles, Shield, UserCheck } from 'lucide-react';

interface TopNavProps {
  currentChild: ChildProfile;
  parentUser: ParentUser;
  activeTab: 'stories' | 'math' | 'doodle' | 'trophies';
  onSelectTab: (tab: 'stories' | 'math' | 'doodle' | 'trophies') => void;
  onOpenAuthModal: (mode: 'child' | 'parent') => void;
  onOpenLabDrawer: () => void;
  archState: ArchitectureState;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentChild,
  activeTab,
  onSelectTab,
  onOpenAuthModal,
  onOpenLabDrawer,
  archState,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('stories')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap font-display">
                Kiddopia Universe
              </span>
            </button>
          </div>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('stories')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'stories' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Story Explorer
            </button>
            <button
              onClick={() => onSelectTab('math')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'math' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Math Planet
            </button>
            <button
              onClick={() => onSelectTab('doodle')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'doodle' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Doodle Studio
            </button>
            <button
              onClick={() => onSelectTab('trophies')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'trophies' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Trophy Case
            </button>
          </nav>

          {/* Zone 3: 1 primary action cluster */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Lab Inspector Quick Action */}
            <button
              onClick={onOpenLabDrawer}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                archState.mode === 'extracted'
                  ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
              title="Open Azure Architecture & Canary Traffic Console"
            >
              {archState.mode === 'extracted' ? (
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
              ) : (
                <Server className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="hidden sm:inline">Azure Lab:</span>
              <span className="font-semibold">
                {archState.mode === 'extracted' ? `AKS Auth (${archState.canaryPercent}%)` : 'Monolith'}
              </span>
            </button>

            {/* Child Avatar / Switcher */}
            <button
              onClick={() => onOpenAuthModal('child')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Switch Child Profile or Login"
            >
              <span className="text-base leading-none">{currentChild.avatar}</span>
              <span className="font-semibold text-slate-900">{currentChild.name}</span>
              <span className="text-amber-500 font-bold tabular-nums">★ {currentChild.stars}</span>
            </button>

            {/* Parent Gate Button */}
            <button
              onClick={() => onOpenAuthModal('parent')}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Parent Controls & PIN Lock"
              aria-label="Parent Settings"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
