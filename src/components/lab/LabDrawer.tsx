import React, { useState } from 'react';
import { ArchitectureState } from '../../services/authSimulator';
import { NetworkLogEntry, LabTask } from '../../types';
import { TopologyDiagram } from './TopologyDiagram';
import { NetworkWiretap } from './NetworkWiretap';
import { LabTasks } from './LabTasks';
import { X, Cloud, Server, Terminal, CheckSquare, Sliders, ExternalLink, ShieldAlert } from 'lucide-react';

interface LabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  archState: ArchitectureState;
  networkLogs: NetworkLogEntry[];
  tasks: LabTask[];
  onSetMode: (mode: 'monolith' | 'extracted') => void;
  onSetCanaryPercent: (percent: number) => void;
  onToggleMonolithHealth: () => void;
  onToggleAksHealth: () => void;
  onClearLogs: () => void;
  onToggleTask: (taskId: string) => void;
  onQuickAction: (actionKey: string) => void;
}

export const LabDrawer: React.FC<LabDrawerProps> = ({
  isOpen,
  onClose,
  archState,
  networkLogs,
  tasks,
  onSetMode,
  onSetCanaryPercent,
  onToggleMonolithHealth,
  onToggleAksHealth,
  onClearLogs,
  onToggleTask,
  onQuickAction,
}) => {
  const [activeTab, setActiveTab] = useState<'topology' | 'wiretap' | 'tasks'>('topology');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header of Console */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 shrink-0">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  Azure Cloud Lab Console
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">
                  Skill-Sch AKS Lab
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Workload: Kiddopia Children Platform · Auth Service Extraction
              </p>
            </div>
          </div>

          {/* Quick Mode Switcher & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl text-xs font-mono">
              <button
                onClick={() => onSetMode('monolith')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  archState.mode === 'monolith'
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Legacy Monolith</span>
              </button>

              <button
                onClick={() => onSetMode('extracted')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  archState.mode === 'extracted'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Carved AKS Auth</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close Console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('topology')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'topology'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Live Topology & Canary</span>
            </button>

            <button
              onClick={() => setActiveTab('wiretap')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'wiretap'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>HTTP Wiretap & Claims ({networkLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Lab Guide & Tasks</span>
            </button>
          </div>

          {/* Outage Warning Banner if simulated failure is active */}
          {!archState.monolithHealthy && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded-lg">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Monolith Deadlock Active</span>
            </div>
          )}
        </div>

        {/* Main Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'topology' && (
            <TopologyDiagram
              archState={archState}
              onSetCanaryPercent={onSetCanaryPercent}
              onToggleMonolithHealth={onToggleMonolithHealth}
              onToggleAksHealth={onToggleAksHealth}
            />
          )}

          {activeTab === 'wiretap' && (
            <NetworkWiretap
              logs={networkLogs}
              onClearLogs={onClearLogs}
            />
          )}

          {activeTab === 'tasks' && (
            <LabTasks
              tasks={tasks}
              onToggleTask={onToggleTask}
              archState={archState}
              onQuickAction={onQuickAction}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span>Tenant: <code className="text-slate-300">azure-sub-skill-sch-kiddopia</code></span>
            <span>·</span>
            <span>Region: <code className="text-slate-300">westeurope (Azure)</code></span>
            <span>·</span>
            <span>AKS Namespace: <code className="text-sky-300">kiddopia-core</code></span>
          </div>

          <a
            href="https://skill-sch.com/cloudlabs?lab=Monolith+Service+Extraction%3A+Carving+Out+Auth+on+Azure"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>skill-sch.com Lab Guide</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
