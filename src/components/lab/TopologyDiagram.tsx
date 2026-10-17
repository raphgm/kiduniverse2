import React from 'react';
import { ArchitectureState } from '../../services/authSimulator';
import { Server, Cloud, ShieldCheck, Database, Key, ArrowRight, Activity, Cpu } from 'lucide-react';

interface TopologyDiagramProps {
  archState: ArchitectureState;
  onSetCanaryPercent: (percent: number) => void;
  onToggleMonolithHealth: () => void;
  onToggleAksHealth: () => void;
}

export const TopologyDiagram: React.FC<TopologyDiagramProps> = ({
  archState,
  onSetCanaryPercent,
  onToggleMonolithHealth,
  onToggleAksHealth,
}) => {
  const isExtracted = archState.mode === 'extracted';
  const canaryPct = isExtracted ? archState.canaryPercent : 0;
  const monolithPct = 100 - canaryPct;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-6">
      
      {/* Title & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <span>AZURE ARCHITECTURE TOPOLOGY</span>
            <span aria-hidden="true">·</span>
            <span>STRANGLER FIG PATTERN</span>
          </div>
          <h4 className="text-lg font-bold font-display text-white mt-0.5">
            Monolith Service Extraction Live Topology
          </h4>
        </div>

        {/* Canary Quick Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl text-xs font-mono">
          <span className="px-2 text-slate-400 text-[11px]">Canary:</span>
          {[0, 25, 50, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => onSetCanaryPercent(pct)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                canaryPct === pct
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Node 1: Client Browser */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CLIENT LAYER</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Kiddopia Client</div>
              <div className="text-[11px] text-slate-400">React + Motion PWA</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 font-mono">
            Origin: <code className="text-slate-300">kiddopia.azureedge.net</code>
          </div>
        </div>

        {/* Node 2: Azure API Management (APIM) Router */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-slate-800/80 border border-sky-500/30 space-y-2 relative">
          <div className="flex items-center justify-between text-xs font-mono text-sky-400">
            <span>AZURE APIM GATEWAY</span>
            <span className="text-[10px] bg-sky-950/80 border border-sky-800 px-1.5 py-0.5 rounded text-sky-300">
              Inbound Policy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Azure APIM</div>
              <div className="text-[11px] text-slate-400">Strangler Fig Canary Router</div>
            </div>
          </div>
          <div className="space-y-1 pt-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>AKS Auth Route:</span>
              <span className="text-sky-300 font-bold">{canaryPct}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Monolith Route:</span>
              <span className="text-amber-300 font-bold">{monolithPct}%</span>
            </div>
          </div>
        </div>

        {/* Node 3 & 4: Two Target Clusters (Monolith vs AKS Microservice) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Target A: Carved AKS Auth Microservice */}
          <div className={`p-4 rounded-xl border transition-all ${
            canaryPct > 0
              ? 'bg-slate-800/90 border-sky-500/60 shadow-lg shadow-sky-950/40 ring-1 ring-sky-500/20'
              : 'bg-slate-800/40 border-slate-700/50 opacity-60'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-sky-400">
                <Cloud className="w-4 h-4" />
                <span className="font-semibold">AZURE AKS MICROSERVICE (AUTH)</span>
              </div>
              <button
                onClick={onToggleAksHealth}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold cursor-pointer transition-colors ${
                  archState.aksAuthHealthy
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {archState.aksAuthHealthy ? '● AKS HEALTHY' : '▲ OUTAGE'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60 font-mono">
                <div className="text-slate-400 text-[10px] flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Key Vault CSI</span>
                </div>
                <div className="text-slate-200 font-semibold truncate">
                  {archState.activeKeyVaultSecretVersion}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60 font-mono">
                <div className="text-slate-400 text-[10px] flex items-center gap-1">
                  <Database className="w-3 h-3 text-sky-400" />
                  <span>Azure Postgres</span>
                </div>
                <div className="text-slate-200 font-semibold truncate">
                  Private Link Subnet
                </div>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Namespace: <code className="text-sky-300">kiddopia-core</code></span>
              <span>Pod Replicas: <code className="text-slate-200">3/3 HPA</code></span>
            </div>
          </div>

          {/* Target B: Legacy Core Monolith */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-amber-400">
                <Server className="w-4 h-4" />
                <span className="font-semibold">LEGACY CORE MONOLITH</span>
              </div>
              <button
                onClick={onToggleMonolithHealth}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold cursor-pointer transition-colors ${
                  archState.monolithHealthy
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
                title="Simulate Monolith failure"
              >
                {archState.monolithHealthy ? '● MONOLITH HEALTHY' : '▲ OUTAGE / DEADLOCK'}
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Handles Story Explorer catalog, Math engine, and fallback monolith user sessions.
            </div>

            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
              <span>Storage: <code className="text-amber-300">Single Shared DB</code></span>
              <span>Auth State: <code className="text-amber-300">Session Cookie</code></span>
            </div>
          </div>

        </div>

      </div>

      {/* Explanatory Architectural Insight */}
      <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-sky-400 font-mono">
          Skill-Sch Lab Concept Note:
        </div>
        <p className="leading-relaxed">
          In this Azure lab, authentication was successfully extracted into a dedicated container running on Azure Kubernetes Service (AKS). Azure Key Vault CSI secret driver injects RS256 token signing certificates without hardcoded credentials. Downstream monolith services transition from database session lookups to stateless OIDC JWT Bearer claims validation.
        </p>
      </div>

    </div>
  );
};
