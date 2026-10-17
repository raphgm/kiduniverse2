import React, { useState } from 'react';
import { StoryBook, StoryPage } from '../types';
import { authSimulator } from '../services/authSimulator';
import confetti from 'canvas-confetti';
import { BookOpen, Sparkles, Volume2, VolumeX, ArrowLeft, ArrowRight, Award, CheckCircle } from 'lucide-react';

interface StoryExplorerProps {
  stories: StoryBook[];
  onAddStars: (amount: number) => void;
  activeTokenSnippet?: string;
}

export const StoryExplorer: React.FC<StoryExplorerProps> = ({
  stories,
  onAddStars,
  activeTokenSnippet,
}) => {
  const [selectedStory, setSelectedStory] = useState<StoryBook | null>(stories[0]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [collectedItems, setCollectedItems] = useState<Record<string, boolean>>({});

  const handleSelectStory = (story: StoryBook) => {
    setSelectedStory(story);
    setCurrentPageIndex(0);
    setIsNarrating(false);
    authSimulator.logAppAction(`Read Story: ${story.title}`, `/api/v1/stories/${story.id}`, activeTokenSnippet);
  };

  const handleCollectItem = (itemKey: string, stars: number) => {
    if (collectedItems[itemKey]) return;
    setCollectedItems((prev) => ({ ...prev, [itemKey]: true }));
    onAddStars(stars);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });
    } catch {
      // safe fallback
    }

    authSimulator.logAppAction(`Collected Interactive Star`, `/api/v1/kids/stars/award`, activeTokenSnippet);
  };

  const handleNextPage = () => {
    if (!selectedStory) return;
    if (currentPageIndex < selectedStory.pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
      authSimulator.logAppAction(`Read Page ${currentPageIndex + 2}`, `/api/v1/stories/${selectedStory.id}/page/${currentPageIndex + 2}`, activeTokenSnippet);
    } else {
      // Completed story
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // safe fallback
      }
      onAddStars(selectedStory.starsReward);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const toggleNarrate = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsNarrating(!isNarrating);
      return;
    }

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1; // friendly storytelling pitch
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  const currentPage: StoryPage | undefined = selectedStory?.pages[currentPageIndex];

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header section with clean unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>WonderLearn Reading Room</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Narrated Tales</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-600 font-semibold">Earn 5 Stars per Book</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Storybook Explorer
          </h2>
        </div>

        {/* Bookshelf quick selector buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleSelectStory(story)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedStory?.id === story.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {story.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Story Reader */}
      {selectedStory && currentPage && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            
            {/* Left side: Visual Illustration Stage with fallback SVG art */}
            <div className={`lg:col-span-5 bg-gradient-to-br ${selectedStory.coverColor} p-8 flex flex-col justify-between text-white relative overflow-hidden`}>
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90 font-mono">
                  {selectedStory.title}
                </span>
                <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                  Page {currentPage.pageNumber} of {selectedStory.pages.length}
                </span>
              </div>

              {/* Center whimsical artistic illustration */}
              <div className="my-auto py-8 flex flex-col items-center justify-center text-center relative z-10">
                {selectedStory.id === 'story-oliver-owl' && (
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-6xl shadow-inner mb-4 animate-bounce duration-1000">
                    🦉
                  </div>
                )}
                {selectedStory.id === 'story-penny-submarine' && (
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-6xl shadow-inner mb-4">
                    🐧
                  </div>
                )}
                {selectedStory.id === 'story-dino-spark' && (
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-6xl shadow-inner mb-4">
                    🦖
                  </div>
                )}
                <p className="text-sm font-medium text-white/90 max-w-xs italic">
                  "{currentPage.illustrationPrompt}"
                </p>
              </div>

              {/* Bottom Interactive item if page has one */}
              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between">
                <div className="text-xs opacity-90">
                  {currentPage.interactiveItem ? 'Interactive Mystery on this page:' : 'Enjoy the journey!'}
                </div>
                {currentPage.interactiveItem && (
                  <button
                    onClick={() => handleCollectItem(`${selectedStory.id}-p${currentPage.pageNumber}`, 2)}
                    disabled={collectedItems[`${selectedStory.id}-p${currentPage.pageNumber}`]}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      collectedItems[`${selectedStory.id}-p${currentPage.pageNumber}`]
                        ? 'bg-emerald-400 text-slate-900 cursor-default'
                        : 'bg-white text-indigo-900 hover:bg-amber-300 shadow-md animate-pulse'
                    }`}
                  >
                    {collectedItems[`${selectedStory.id}-p${currentPage.pageNumber}`] ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Collected! (+2★)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{currentPage.interactiveItem.label}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Story prose & Narration controls */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Audio Narration Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Chapter {currentPageIndex + 1}
                  </div>
                  <button
                    onClick={() => toggleNarrate(currentPage.text)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {isNarrating ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        <span>Pause Narration</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Listen to Story</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Story Paragraph */}
                <div className="py-4">
                  <p className="text-xl sm:text-2xl text-slate-800 font-serif leading-relaxed tracking-wide">
                    {currentPage.text}
                  </p>
                </div>
              </div>

              {/* Bottom Pagination & Navigation Controls */}
              <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    currentPageIndex === 0
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {selectedStory.pages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPageIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                        currentPageIndex === idx
                          ? 'bg-indigo-600 scale-125'
                          : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Go to page ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>
                    {currentPageIndex === selectedStory.pages.length - 1 ? 'Finish Story (+5★)' : 'Next Page'}
                  </span>
                  {currentPageIndex === selectedStory.pages.length - 1 ? (
                    <Award className="w-4 h-4 text-amber-300" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </section>
  );
};
