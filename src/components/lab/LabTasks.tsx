import React from 'react';
import { LabTask } from '../../types';
import { ArchitectureState } from '../../services/authSimulator';
import { CheckCircle2, Circle, ArrowRight, Play, ExternalLink } from 'lucide-react';

interface LabTasksProps {
  tasks: LabTask[];
  onToggleTask: (taskId: string) => void;
  archState: ArchitectureState;
  onQuickAction: (actionKey: string) => void;
}

export const LabTasks: React.FC<LabTasksProps> = ({
  tasks,
  onToggleTask,
  archState,
  onQuickAction,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-6">
      
      {/* Title & Lab Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <span>SKILL.SCH CLOUD LAB CURRICULUM</span>
            <span aria-hidden="true">·</span>
            <span>AZURE AKS & APIM</span>
          </div>
          <h4 className="text-lg font-bold font-display text-white mt-0.5">
            Monolith Service Extraction: Carving Out Auth
          </h4>
        </div>

        <a
          href="https://skill-sch.com/cloudlabs?lab=Monolith+Service+Extraction%3A+Carving+Out+Auth+on+Azure"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-mono font-semibold transition-colors shrink-0"
        >
          <span>Open Skill-Sch Lab Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Curriculum Completion</span>
          <span className="text-sky-400 font-bold">{completedCount} of {tasks.length} Completed</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full transition-all duration-300"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-slate-800/80 border-emerald-500/30'
                  : 'bg-slate-800/40 border-slate-700/60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {task.phase}
                      </span>
                      <h5 className="text-sm font-bold text-slate-100">
                        {task.title}
                      </h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {task.description}
                    </p>
                    <div className="text-[11px] text-sky-400/90 font-mono pt-1">
                      💡 {task.actionHint}
                    </div>
                  </div>
                </div>

                {/* Quick Simulation Action for the student */}
                <div className="shrink-0">
                  {task.id === 'task-2-deploy-aks' && !task.completed && (
                    <button
                      onClick={() => {
                        onQuickAction('deploy-aks');
                        onToggleTask(task.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Provision AKS</span>
                    </button>
                  )}

                  {task.id === 'task-3-apim-canary' && !task.completed && (
                    <button
                      onClick={() => {
                        onQuickAction('set-canary-25');
                        onToggleTask(task.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Set Canary 25%</span>
                    </button>
                  )}

                  {task.id === 'task-5-cutover-retire' && !task.completed && (
                    <button
                      onClick={() => {
                        onQuickAction('cutover-100');
                        onToggleTask(task.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>100% Cutover</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
