import React, { useState } from 'react';
import { Trophy, ChildProfile } from '../types';
import confetti from 'canvas-confetti';
import { Award, Lock, Sparkles, CheckCircle, X, Download } from 'lucide-react';

interface TrophyCaseProps {
  trophies: Trophy[];
  currentChild: ChildProfile;
}

export const TrophyCase: React.FC<TrophyCaseProps> = ({
  trophies,
  currentChild,
}) => {
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);

  const handleOpenCertificate = (t: Trophy) => {
    setSelectedTrophy(t);
    if (t.unlocked) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#6366F1'],
        });
      } catch {
        // safe fallback
      }
    }
  };

  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with clean unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Hall of Fame</span>
            <span aria-hidden="true">·</span>
            <span>Cosmic Achievements</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-600 font-semibold">{unlockedCount} of {trophies.length} Badges Earned</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Trophy Case & Certificates
          </h2>
        </div>

        {/* Level badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Rank: </span>
            <span className="font-bold">Starlight Explorer Level 2</span>
          </div>
        </div>
      </div>

      {/* Trophies Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trophies.map((trophy) => {
          return (
            <div
              key={trophy.id}
              onClick={() => handleOpenCertificate(trophy)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                trophy.unlocked
                  ? 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'
                  : 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-80'
              }`}
            >
              {trophy.unlocked && (
                <div className="absolute top-3 right-3 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              {!trophy.unlocked && (
                <div className="absolute top-3 right-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs transition-transform group-hover:scale-110 ${
                  trophy.unlocked ? 'bg-amber-50 border border-amber-200' : 'bg-slate-200 text-slate-400'
                }`}>
                  {trophy.icon}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 font-display truncate">
                    {trophy.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {trophy.description}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 font-mono">
                    {trophy.unlocked ? `Awarded: ${trophy.unlockedAt || 'Recent'}` : `Goal: ${trophy.criteria}`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {selectedTrophy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <button
              onClick={() => setSelectedTrophy(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-4xl shadow-sm mb-2">
                {selectedTrophy.icon}
              </div>
              <div className="text-xs uppercase tracking-widest text-amber-600 font-semibold font-mono">
                Official Achievement Certificate
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">
                {selectedTrophy.title}
              </h3>
            </div>

            {/* Certificate Body */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-center space-y-2 text-sm text-slate-700">
              <p>
                This certifies that cosmic explorer <strong className="text-slate-900">{currentChild.name}</strong> has demonstrated bravery and curiosity!
              </p>
              <p className="text-xs text-slate-500 italic">
                "{selectedTrophy.description}"
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-2 border-t border-slate-100 font-mono">
              <span>Status: {selectedTrophy.unlocked ? 'Verified & Awarded' : 'In Progress'}</span>
              <span>Kiddopia Protocol v2</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  try {
                    confetti({ particleCount: 90, spread: 70 });
                  } catch {}
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Celebrate Again!</span>
              </button>
              <button
                onClick={() => setSelectedTrophy(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
