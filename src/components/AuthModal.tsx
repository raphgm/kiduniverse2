import React, { useState } from 'react';
import { ChildProfile, ParentUser, DecodedToken } from '../types';
import { authSimulator, ArchitectureState } from '../services/authSimulator';
import { X, Shield, Sparkles, KeyRound, Check, AlertCircle, RefreshCw, Terminal, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'child' | 'parent';
  childrenProfiles: ChildProfile[];
  parentUser: ParentUser;
  currentChild: ChildProfile;
  onSelectChild: (child: ChildProfile, tokenString: string, decoded: DecodedToken) => void;
  archState: ArchitectureState;
}

const COLOR_TILES = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Purple', hex: '#8B5CF6' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  childrenProfiles,
  parentUser,
  currentChild,
  onSelectChild,
  archState,
}) => {
  const [activeTab, setActiveTab] = useState<'child' | 'parent'>(mode);
  const [selectedKid, setSelectedKid] = useState<ChildProfile>(currentChild);
  const [enteredPattern, setEnteredPattern] = useState<string[]>([]);
  const [parentPin, setParentPin] = useState<string>('');
  const [parentGateAnswer, setParentGateAnswer] = useState<string>('');
  const [parentGateMath] = useState<{ a: number; b: number; result: number }>({ a: 7, b: 6, result: 42 });
  const [parentLoggedIn, setParentLoggedIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastAuthResult, setLastAuthResult] = useState<{ handledBy: string; latency: number; provider: string } | null>(null);

  if (!isOpen) return null;

  const handleChildTileClick = (hex: string) => {
    if (enteredPattern.length < 3) {
      const next = [...enteredPattern, hex];
      setEnteredPattern(next);
      setErrorMessage(null);
    }
  };

  const handleResetPattern = () => {
    setEnteredPattern([]);
    setErrorMessage(null);
  };

  const handleChildLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await authSimulator.loginChild(selectedKid);
      setLastAuthResult({
        handledBy: res.handledBy,
        latency: res.latency,
        provider: res.decoded.payload.auth_provider,
      });

      onSelectChild(selectedKid, res.token, res.decoded);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Verify adult math gate first
    if (parseInt(parentGateAnswer, 10) !== parentGateMath.result) {
      setErrorMessage(`Parent Gate verification failed: Please calculate ${parentGateMath.a} × ${parentGateMath.b}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authSimulator.verifyParentPin(parentPin, parentUser);
      if (res.success && res.token && res.decoded) {
        setParentLoggedIn(true);
        setLastAuthResult({
          handledBy: res.handledBy,
          latency: res.latency,
          provider: res.decoded.payload.auth_provider,
        });
      } else {
        setErrorMessage('Incorrect 4-digit Parent PIN. Hint: 4821');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Parent verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch: Child vs Parent */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => {
              setActiveTab('child');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'child'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎈 Child Quick Sign-In</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('parent');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'parent'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Parent Controls & Lock</span>
          </button>
        </div>

        {/* Active Architecture Route Banner */}
        <div className="mb-6 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">Route target:</span>
          <span className="font-semibold text-slate-800">
            {archState.mode === 'extracted'
              ? `Azure APIM → AKS (${archState.canaryPercent}%) / Monolith`
              : 'Direct → Legacy Monolith'}
          </span>
        </div>

        {/* CHILD AUTH FLOW */}
        {activeTab === 'child' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Choose Your Child Avatar
              </h3>
              <p className="text-xs text-slate-500">
                Select your animal profile and enter your 3-color secret code!
              </p>
            </div>

            {/* Child Profile Cards */}
            <div className="grid grid-cols-3 gap-3">
              {childrenProfiles.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    setSelectedKid(k);
                    setEnteredPattern([]);
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    selectedKid.id === k.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-3xl">{k.avatar}</span>
                  <span className="text-xs font-bold text-slate-900">{k.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Age {k.age}</span>
                </button>
              ))}
            </div>

            {/* 3-Color Pattern Entry */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Secret Color Pattern ({enteredPattern.length}/3)
                </span>
                <button
                  onClick={handleResetPattern}
                  className="text-slate-400 hover:text-slate-600 font-mono text-[11px] cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Pattern slots */}
              <div className="flex items-center justify-center gap-3 py-1">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center transition-all shadow-inner"
                    style={{
                      backgroundColor: enteredPattern[idx] || '#FFFFFF',
                      borderColor: enteredPattern[idx] ? enteredPattern[idx] : '#CBD5E1',
                    }}
                  >
                    {enteredPattern[idx] && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                  </div>
                ))}
              </div>

              {/* Color tiles to click */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {COLOR_TILES.map((tile) => (
                  <button
                    key={tile.name}
                    onClick={() => handleChildTileClick(tile.hex)}
                    className="w-9 h-9 rounded-xl shadow-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: tile.hex }}
                    title={tile.name}
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {lastAuthResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between font-mono">
                <span>Authenticated via {lastAuthResult.handledBy}</span>
                <span className="font-bold">{lastAuthResult.latency}ms</span>
              </div>
            )}

            <button
              onClick={handleChildLogin}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying Credentials...' : `Enter Universe as ${selectedKid.name}`}</span>
            </button>
          </div>
        )}

        {/* PARENT AUTH FLOW */}
        {activeTab === 'parent' && (
          <div className="space-y-6">
            {!parentLoggedIn ? (
              <form onSubmit={handleParentLogin} className="space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 font-display">
                    Parental Security Challenge
                  </h3>
                  <p className="text-xs text-slate-500">
                    To comply with COPPA & Children’s Safety, solve the math problem and enter your 4-digit PIN.
                  </p>
                </div>

                {/* Math challenge */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <label className="text-xs font-semibold text-amber-900 block">
                    Grown-Up Math Check: What is {parentGateMath.a} × {parentGateMath.b}?
                  </label>
                  <input
                    type="number"
                    value={parentGateAnswer}
                    onChange={(e) => setParentGateAnswer(e.target.value)}
                    placeholder="Enter answer (42)"
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                {/* 4-digit PIN */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">4-Digit Parent PIN</label>
                    <span className="text-slate-400 font-mono">Demo PIN: 4821</span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={parentPin}
                    onChange={(e) => setParentPin(e.target.value)}
                    placeholder="••••"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Unlock Parent Control Center'}</span>
                </button>
              </form>
            ) : (
              /* Authenticated Parent Dashboard */
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      Parent Dashboard ({parentUser.parentName})
                    </h3>
                    <p className="text-xs text-slate-500">{parentUser.email}</p>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    OIDC Token Active
                  </span>
                </div>

                {/* Child Profiles Screen Time */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
                    Screen Time Limits & Stars
                  </span>
                  {childrenProfiles.map((k) => (
                    <div
                      key={k.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{k.avatar}</span>
                        <div>
                          <div className="font-bold text-slate-900">{k.name}</div>
                          <div className="text-slate-500 text-[10px]">Daily Limit: 45 min</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-600 font-bold font-mono">{k.stars} Stars</span>
                        <div className="text-[10px] text-slate-400 font-mono">3 Badges</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setParentLoggedIn(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Lock Parent Portal
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
