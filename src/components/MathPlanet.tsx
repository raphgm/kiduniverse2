import React, { useState } from 'react';
import { MathQuestion } from '../types';
import { INITIAL_MATH_QUESTIONS } from '../data/initialData';
import { authSimulator } from '../services/authSimulator';
import confetti from 'canvas-confetti';
import { Rocket, Sparkles, RefreshCw, CheckCircle2, XCircle, Flame } from 'lucide-react';

interface MathPlanetProps {
  onAddStars: (amount: number) => void;
  activeTokenSnippet?: string;
}

export const MathPlanet: React.FC<MathPlanetProps> = ({
  onAddStars,
  activeTokenSnippet,
}) => {
  const [questions, setQuestions] = useState<MathQuestion[]>(INITIAL_MATH_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [totalSolved, setTotalSolved] = useState<number>(0);

  const currentQ = questions[currentIndex % questions.length];

  const handleSelectAnswer = (ans: number) => {
    if (isAnswered) return;
    setSelectedAnswer(ans);
    setIsAnswered(true);

    const correct = ans === currentQ.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setTotalSolved((prev) => prev + 1);
      const earnedStars = nextStreak >= 3 ? 3 : 2;
      onAddStars(earnedStars);

      try {
        if (nextStreak % 3 === 0) {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#38BDF8', '#F59E0B', '#10B981'],
          });
        }
      } catch {
        // safe fallback
      }

      authSimulator.logAppAction(`Solved Math Question`, `/api/v1/math/grade/correct`, activeTokenSnippet);
    } else {
      setStreak(0);
      authSimulator.logAppAction(`Attempted Math Question`, `/api/v1/math/grade/retry`, activeTokenSnippet);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  // Generate a new random question on the fly
  const generateNewChallenge = () => {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    const isSub = Math.random() > 0.5 && a > b;
    const op = isSub ? '-' : '+';
    const ans = isSub ? a - b : a + b;

    const dummyOptions = new Set<number>([ans]);
    while (dummyOptions.size < 4) {
      const offset = (Math.floor(Math.random() * 5) - 2) || 1;
      const fake = Math.max(0, ans + offset);
      dummyOptions.add(fake);
    }

    const newQ: MathQuestion = {
      id: `m-rnd-${Date.now()}`,
      question: `Calculate: ${a} ${op} ${b} = ?`,
      operandA: a,
      operandB: b,
      operator: op as '+' | '-',
      correctAnswer: ans,
      options: Array.from(dummyOptions).sort(() => Math.random() - 0.5),
      visualItems: isSub ? '🚀' : '⭐',
    };

    setQuestions((prev) => [...prev, newQ]);
    setCurrentIndex(questions.length);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
  };

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with clean unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Cosmic Academy</span>
            <span aria-hidden="true">·</span>
            <span>Early Math & Arithmetic</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-600 font-semibold">Streak Bonus Stars</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Math Planet Rocket Launch
          </h2>
        </div>

        {/* Streak & Stats */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Streak: </span>
            <span className="font-bold tabular-nums font-mono">{streak} in a row</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
            <span>Solved: </span>
            <span className="font-bold tabular-nums font-mono">{totalSolved}</span>
          </div>
        </div>
      </div>

      {/* Main Math Stage */}
      <div className="mt-8 max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        
        {/* Top Challenge Prompt */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Rocket className="w-3.5 h-3.5" />
            <span>Question #{currentIndex + 1}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            {currentQ.question}
          </h3>

          <div className="text-3xl sm:text-4xl font-bold font-mono tracking-wider text-indigo-600 py-2">
            {currentQ.operandA} {currentQ.operator} {currentQ.operandB} = ?
          </div>
        </div>

        {/* Visual Item Counting Board */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/40 border border-slate-200 text-center space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Visual Starlight Counter
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            {/* Group A */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              {Array.from({ length: currentQ.operandA }).map((_, i) => (
                <span key={`a-${i}`} className="text-2xl animate-pulse">
                  {currentQ.visualItems}
                </span>
              ))}
              <span className="text-xs font-mono font-bold text-slate-400 ml-1">
                ({currentQ.operandA})
              </span>
            </div>

            <span className="text-2xl font-bold text-slate-400 font-mono">
              {currentQ.operator}
            </span>

            {/* Group B */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              {Array.from({ length: currentQ.operandB }).map((_, i) => (
                <span key={`b-${i}`} className="text-2xl animate-pulse">
                  {currentQ.visualItems}
                </span>
              ))}
              <span className="text-xs font-mono font-bold text-slate-400 ml-1">
                ({currentQ.operandB})
              </span>
            </div>
          </div>
        </div>

        {/* 4 Answer Choice Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {currentQ.options.map((option) => {
            let btnStyle = 'border-slate-200 bg-white hover:border-indigo-400 text-slate-800 hover:bg-indigo-50/40';

            if (isAnswered) {
              if (option === currentQ.correctAnswer) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30';
              } else if (option === selectedAnswer) {
                btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
              } else {
                btnStyle = 'opacity-40 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed';
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                className={`py-5 px-6 rounded-2xl border text-2xl font-bold font-mono transition-all duration-150 cursor-pointer flex items-center justify-center gap-3 ${btnStyle}`}
              >
                <span>{option}</span>
                {isAnswered && option === currentQ.correctAnswer && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                )}
                {isAnswered && option === selectedAnswer && option !== currentQ.correctAnswer && (
                  <XCircle className="w-6 h-6 text-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback message and next question action */}
        {isAnswered && (
          <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200">
            <div className="flex items-center gap-3 text-center sm:text-left">
              {isCorrect ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-lg font-bold">
                  !
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {isCorrect ? 'Stellar Job! Rocket fueled! (+2★)' : 'Almost! Try counting the stars together.'}
                </div>
                <div className="text-xs text-slate-500">
                  {currentQ.operandA} {currentQ.operator} {currentQ.operandB} = {currentQ.correctAnswer}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              Next Rocket Challenge →
            </button>
          </div>
        )}

        {/* Generate dynamic challenge */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Need more practice?</span>
          <button
            onClick={generateNewChallenge}
            className="flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Random Math Puzzle</span>
          </button>
        </div>

      </div>
    </section>
  );
};
