import React, { useState } from 'react';
import { LabTask } from '../../types';
import { ArchitectureState } from '../../services/authSimulator';
import { CheckCircle2, Circle, ArrowRight, Play, ExternalLink, Code2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface LabTasksProps {
  tasks: LabTask[];
  onToggleTask: (taskId: string) => void;
  archState: ArchitectureState;
  onQuickAction: (actionKey: string) => void;
}

const AZURE_SNIPPETS: Record<string, { title: string; language: string; code: string }> = {
  'task-1-monolith-audit': {
    title: 'Monolith HTTP Probe & Session Cookie Audit',
    language: 'bash',
    code: `# 1. Baseline Request to Legacy Monolith Auth
curl -i -X POST https://apim-kiddopia.azure-api.net/api/v1/auth/login/child \\
  -H "Host: apim-kiddopia.azure-api.net" \\
  -H "Content-Type: application/json" \\
  -d '{"childId":"kid-leo-01"}'

# Response Headers observe stateful cookie:
# Set-Cookie: session_id=sid_91823; Path=/; HttpOnly; SameSite=Strict
# X-Monolith-DB-Lock-Latency: 142ms`,
  },
  'task-2-deploy-aks': {
    title: 'AKS SecretProviderClass & PostgreSQL Private Link Manifest',
    language: 'yaml',
    code: `apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-kv-csi-auth
  namespace: kiddopia-core
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    useVMManagedIdentity: "true"
    userAssignedIdentityID: "\${AZURE_MANAGED_IDENTITY_ID}"
    keyvaultName: "kv-kiddopia-prod"
    cloudName: "AzurePublicCloud"
    objects: |
      array:
        - objectName: jwt-signing-cert-rs256
          objectType: key
        - objectName: postgres-private-link-conn
          objectType: secret`,
  },
  'task-3-apim-canary': {
    title: 'Azure APIM Inbound Strangler Fig Canary Policy',
    language: 'xml',
    code: `<policies>
  <inbound>
    <base />
    <!-- Skill-Sch Strangler Fig: Split 25% traffic to AKS Auth microservice -->
    <choose>
      <when condition="@(new Random().Next(100) < 25)">
        <set-backend-service base-url="https://aks-ingress.skill-sch.internal/auth" />
        <set-header name="X-APIM-Canary-Target" exists-action="override">
          <value>aks-auth-service-v2.kiddopia-core</value>
        </set-header>
      </when>
      <otherwise>
        <set-backend-service base-url="https://monolith-core.skill-sch.internal/api/v1/auth" />
      </otherwise>
    </choose>
  </inbound>
</policies>`,
  },
  'task-4-token-claims': {
    title: 'Stateless RS256 OIDC Token Structure (Azure Entra ID compatible)',
    language: 'json',
    code: `// Decoded RS256 Bearer Token payload issued by AKS
{
  "iss": "https://aks-auth.skill-sch.azure/v2",
  "sub": "kid-leo-01",
  "aud": "https://api.kiddopia.io/kids",
  "tenant_id": "azure-sub-skill-sch-kiddopia",
  "role": "child",
  "user_name": "Leo",
  "family_id": "fam-sarah-jenkins",
  "scope": "read:stories read:math write:doodles write:stars",
  "auth_provider": "azure_aks_auth_v2",
  "vault_key_version": "7f91a82d-azure-kv-2026",
  "exp": 1792248525
}`,
  },
  'task-5-cutover-retire': {
    title: '100% APIM Cutover & Monolith Auth Retirement Policy',
    language: 'xml',
    code: `<!-- 1. Permanent routing to AKS Microservice (100% Cutover) -->
<set-backend-service base-url="https://aks-ingress.skill-sch.internal/auth" />

<!-- 2. Decommission response on old monolithic endpoint -->
<inbound>
  <return-response>
    <set-status code="410" reason="Monolith Auth Endpoint Permanently Retired" />
    <set-header name="Content-Type" exists-action="override">
      <value>application/json</value>
    </set-header>
    <set-body>{"error":"Gone","message":"Please migrate to OIDC v2 Bearer token"}</set-body>
  </return-response>
</inbound>`,
  },
};

export const LabTasks: React.FC<LabTasksProps> = ({
  tasks,
  onToggleTask,
  archState,
  onQuickAction,
}) => {
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        {tasks.map((task) => {
          const snippet = AZURE_SNIPPETS[task.id];
          const isSnippetOpen = expandedSnippet === task.id;

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
                <div className="shrink-0 flex items-center gap-2">
                  {snippet && (
                    <button
                      onClick={() => setExpandedSnippet(isSnippetOpen ? null : task.id)}
                      className="p-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
                      title="Toggle Azure Code Snippet"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Azure Config</span>
                      {isSnippetOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}

                  {task.id === 'task-1-monolith-audit' && !task.completed && (
                    <button
                      onClick={() => {
                        onQuickAction('audit-monolith');
                        onToggleTask(task.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Audit Probe</span>
                    </button>
                  )}

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

                  {task.id === 'task-4-token-claims' && !task.completed && (
                    <button
                      onClick={() => {
                        onQuickAction('validate-token');
                        onToggleTask(task.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Validate Token</span>
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

              {/* Expandable Azure Code Snippet */}
              {isSnippetOpen && snippet && (
                <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-sky-300 font-semibold">{snippet.title}</span>
                    <button
                      onClick={() => handleCopy(task.id, snippet.code)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer transition-colors"
                    >
                      {copiedId === task.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {snippet.code}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
