import React, { useState } from 'react';
import { NetworkLogEntry } from '../../types';
import { Terminal, Shield, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw, Trash2, Key } from 'lucide-react';

interface NetworkWiretapProps {
  logs: NetworkLogEntry[];
  onClearLogs: () => void;
}

export const NetworkWiretap: React.FC<NetworkWiretapProps> = ({
  logs,
  onClearLogs,
}) => {
  const [selectedLog, setSelectedLog] = useState<NetworkLogEntry | null>(logs[0] || null);
  const [filterType, setFilterType] = useState<'all' | 'auth' | 'content'>('all');

  const filteredLogs = logs.filter((l) => {
    if (filterType === 'auth') return l.endpoint.includes('/auth') || l.endpoint.includes('/parent/verify');
    if (filterType === 'content') return !l.endpoint.includes('/auth') && !l.endpoint.includes('/parent/verify');
    return true;
  });

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Terminal className="w-4 h-4" />
            <span>REAL-TIME HTTP WIRETAP & JWT INSPECTOR</span>
          </div>
          <h4 className="text-lg font-bold font-display text-white mt-0.5">
            Network Request Stream & OIDC Claims
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('auth')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'auth' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Auth
            </button>
            <button
              onClick={() => setFilterType('content')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'content' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Content
            </button>
          </div>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Clear Network Stream"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Stream on Left, Details/JWT on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Request List */}
        <div className="lg:col-span-6 space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No network requests recorded for this filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              const isAks = log.handledBy === 'aks-auth-service';
              const isSuccess = log.status >= 200 && log.status < 300;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-800 border-sky-500 ring-1 ring-sky-500/40 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'POST' ? 'bg-amber-950 text-amber-300' : 'bg-sky-950 text-sky-300'
                      }`}>
                        {log.method}
                      </span>
                      <span className="text-slate-200 font-medium truncate max-w-[180px]">
                        {log.endpoint}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={`font-bold ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {log.status}
                      </span>
                      <span className="text-slate-400 tabular-nums">
                        {log.latencyMs}ms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className={isAks ? 'text-sky-400' : 'text-amber-400'}>
                      ● {isAks ? 'Azure AKS Auth' : 'Monolith'}
                    </span>
                    <span className="text-slate-500">{log.authType}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Request & Decoded Token Inspector */}
        <div className="lg:col-span-6 bg-slate-800/70 rounded-xl border border-slate-700/80 p-5 space-y-4">
          {selectedLog ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-sky-950 text-sky-300">
                    {selectedLog.method}
                  </span>
                  <span className="text-sm font-bold text-slate-200 font-mono truncate">
                    {selectedLog.endpoint}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {selectedLog.latencyMs}ms latency
                </div>
              </div>

              {/* Upstream Handler & Headers */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Inbound & Routing Headers
                </span>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  {Object.entries(selectedLog.requestHeaders).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-slate-500 shrink-0">{k}:</span>
                      <span className="text-slate-200 break-all">{v}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 text-sky-400">
                    <span className="text-slate-500 shrink-0">X-Upstream-Backend:</span>
                    <span>{selectedLog.handledBy}</span>
                  </div>
                </div>
              </div>

              {/* JWT Claims or Cookie info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Decoded Identity Claims</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {selectedLog.decodedToken ? 'RS256 / Azure Entra ID' : 'Legacy Session Cookie'}
                  </span>
                </div>

                {selectedLog.decodedToken ? (
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedLog.decodedToken, null, 2)}
                  </pre>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-400/90 leading-relaxed">
                    Session-based state: User session cookie verified directly against the monolith PostgreSQL database. No decoupled stateless token payload available.
                  </div>
                )}
              </div>

              {/* Response Payload */}
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Response Body
                </span>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {selectedLog.responseSnippet}
                </pre>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 font-mono">
              Select a request from the stream to inspect headers and decoded claims.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
