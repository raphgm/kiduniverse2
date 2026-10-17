import React, { useState, useEffect } from 'react';
import {
  INITIAL_CHILDREN,
  INITIAL_PARENT,
  INITIAL_STORIES,
  INITIAL_TROPHIES,
  SKILL_SCH_LAB_TASKS,
} from './data/initialData';
import { ChildProfile, ParentUser, StoryBook, Trophy, LabTask, DecodedToken, NetworkLogEntry } from './types';
import { authSimulator, ArchitectureState } from './services/authSimulator';
import { TopNav } from './components/TopNav';
import { HeroBanner } from './components/HeroBanner';
import { StoryExplorer } from './components/StoryExplorer';
import { MathPlanet } from './components/MathPlanet';
import { DoodleStudio } from './components/DoodleStudio';
import { TrophyCase } from './components/TrophyCase';
import { AuthModal } from './components/AuthModal';
import { LabDrawer } from './components/lab/LabDrawer';
import confetti from 'canvas-confetti';
import { Cloud, Server, Sparkles, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>(INITIAL_CHILDREN);
  const [currentChild, setCurrentChild] = useState<ChildProfile>(INITIAL_CHILDREN[0]);
  const [parentUser, setParentUser] = useState<ParentUser>(INITIAL_PARENT);
  const [stories, setStories] = useState<StoryBook[]>(INITIAL_STORIES);
  const [trophies, setTrophies] = useState<Trophy[]>(INITIAL_TROPHIES);
  const [tasks, setTasks] = useState<LabTask[]>(SKILL_SCH_LAB_TASKS);

  const [activeTab, setActiveTab] = useState<'stories' | 'math' | 'doodle' | 'trophies'>('stories');
  const [archState, setArchState] = useState<ArchitectureState>(authSimulator.getState());
  const [networkLogs, setNetworkLogs] = useState<NetworkLogEntry[]>(authSimulator.getNetworkLogs());

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'child' | 'parent'>('child');
  const [isLabDrawerOpen, setIsLabDrawerOpen] = useState<boolean>(false);

  const [activeToken, setActiveToken] = useState<{ tokenString: string; decoded: DecodedToken }>(() =>
    authSimulator.createTokenForChild(INITIAL_CHILDREN[0])
  );

  // Subscribe to simulator events
  useEffect(() => {
    const unsubState = authSimulator.subscribeState((newState) => {
      setArchState(newState);
    });
    const unsubLogs = authSimulator.subscribeLogs((newLogs) => {
      setNetworkLogs(newLogs);
    });
    return () => {
      unsubState();
      unsubLogs();
    };
  }, []);

  // Award stars to active child and verify milestones
  const handleAddStars = (amount: number) => {
    setCurrentChild((prev) => {
      const nextStars = prev.stars + amount;
      const updatedChild = { ...prev, stars: nextStars };

      // Update in children profiles array
      setChildrenProfiles((all) =>
        all.map((c) => (c.id === prev.id ? updatedChild : c))
      );

      // Check for star collector trophy milestone (>= 30 stars)
      if (nextStars >= 30) {
        setTrophies((allTrophies) =>
          allTrophies.map((t) => {
            if (t.id === 'trophy-star-collector' && !t.unlocked) {
              return {
                ...t,
                unlocked: true,
                unlockedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              };
            }
            return t;
          })
        );
      }

      return updatedChild;
    });
  };

  const handleOpenAuthModal = (mode: 'child' | 'parent') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSelectChild = (child: ChildProfile, tokenString: string, decoded: DecodedToken) => {
    setCurrentChild(child);
    setActiveToken({ tokenString, decoded });

    // Unlock secret pin trophy if first time
    setTrophies((prev) =>
      prev.map((t) => (t.id === 'trophy-secret-pin' ? { ...t, unlocked: true, unlockedAt: 'Just Now' } : t))
    );
  };

  // Lab Task toggle
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Quick Action execution from lab task list
  const handleQuickAction = (actionKey: string) => {
    if (actionKey === 'deploy-aks') {
      authSimulator.setMode('extracted');
      authSimulator.setCanaryPercent(10);
    } else if (actionKey === 'set-canary-25') {
      authSimulator.setMode('extracted');
      authSimulator.setCanaryPercent(25);
    } else if (actionKey === 'cutover-100') {
      authSimulator.setMode('extracted');
      authSimulator.setCanaryPercent(100);

      // Unlock Cloud Architect trophy with confetti
      setTrophies((prev) =>
        prev.map((t) => (t.id === 'trophy-azure-cutover' ? { ...t, unlocked: true, unlockedAt: 'Just Now' } : t))
      );

      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#0284C7', '#38BDF8', '#F59E0B', '#10B981'],
        });
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 3-Zone Top Navigation Bar */}
      <TopNav
        currentChild={currentChild}
        parentUser={parentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenLabDrawer={() => setIsLabDrawerOpen(true)}
        archState={archState}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* Playful Hero Banner & Lab Status Ribbon */}
        <HeroBanner
          currentChild={currentChild}
          onSelectTab={setActiveTab}
          onOpenLabDrawer={() => setIsLabDrawerOpen(true)}
          archState={archState}
        />

        {/* Dynamic Section Viewer */}
        {activeTab === 'stories' && (
          <StoryExplorer
            stories={stories}
            onAddStars={handleAddStars}
            activeTokenSnippet={activeToken.tokenString}
          />
        )}

        {activeTab === 'math' && (
          <MathPlanet
            onAddStars={handleAddStars}
            activeTokenSnippet={activeToken.tokenString}
          />
        )}

        {activeTab === 'doodle' && (
          <DoodleStudio
            onAddStars={handleAddStars}
            activeTokenSnippet={activeToken.tokenString}
          />
        )}

        {activeTab === 'trophies' && (
          <TrophyCase
            trophies={trophies}
            currentChild={currentChild}
          />
        )}
      </main>

      {/* Persistent Floating Azure Lab Inspector Bar (Always accessible for lab testing) */}
      <div className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsLabDrawerOpen(true)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 border ${
            archState.mode === 'extracted'
              ? 'bg-slate-900 border-sky-500/60 text-white shadow-sky-950/30'
              : 'bg-slate-900 border-amber-500/60 text-white shadow-amber-950/30'
          }`}
          title="Open Azure Architecture & Canary Traffic Console"
        >
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {archState.mode === 'extracted' ? (
              <Cloud className="w-4 h-4 text-sky-400" />
            ) : (
              <Server className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-bold">Azure Lab Console</span>
          </div>

          <span className="text-slate-600">|</span>

          <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
            archState.mode === 'extracted'
              ? 'bg-sky-950 text-sky-300 border border-sky-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {archState.mode === 'extracted' ? `AKS ${archState.canaryPercent}%` : 'Monolith'}
          </span>
        </button>
      </div>

      {/* Quiet, Compliant Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Kiddopia Universe</span>
            <span>·</span>
            <span>COPPA & Child Safe Environment</span>
            <span>·</span>
            <span>Skill-Sch Cloud Lab Workload</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLabDrawerOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Open Architecture Wiretap
            </button>
            <a
              href="https://skill-sch.com/cloudlabs?lab=Monolith+Service+Extraction%3A+Carving+Out+Auth+on+Azure"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View Azure Lab Instructions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Child & Parent Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authModalMode}
        childrenProfiles={childrenProfiles}
        parentUser={parentUser}
        currentChild={currentChild}
        onSelectChild={handleSelectChild}
        archState={archState}
      />

      {/* Azure Cloud Lab Slide-over Console */}
      <LabDrawer
        isOpen={isLabDrawerOpen}
        onClose={() => setIsLabDrawerOpen(false)}
        archState={archState}
        networkLogs={networkLogs}
        tasks={tasks}
        onSetMode={(m) => authSimulator.setMode(m)}
        onSetCanaryPercent={(p) => authSimulator.setCanaryPercent(p)}
        onToggleMonolithHealth={() => authSimulator.toggleMonolithHealth()}
        onToggleAksHealth={() => authSimulator.toggleAksHealth()}
        onClearLogs={() => authSimulator.clearLogs()}
        onToggleTask={handleToggleTask}
        onQuickAction={handleQuickAction}
      />

    </div>
  );
}
