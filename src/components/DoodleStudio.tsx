import React, { useRef, useState, useEffect } from 'react';
import { authSimulator } from '../services/authSimulator';
import confetti from 'canvas-confetti';
import { Palette, Undo2, Trash2, Download, Sparkles, Check, Heart, Star } from 'lucide-react';

interface DoodleStudioProps {
  onAddStars: (amount: number) => void;
  activeTokenSnippet?: string;
}

interface SavedArtwork {
  id: string;
  dataUrl: string;
  timestamp: string;
  title: string;
}

const BRUSH_COLORS = [
  { name: 'Cosmic Indigo', hex: '#4F46E5' },
  { name: 'Bubblegum Pink', hex: '#EC4899' },
  { name: 'Sunny Lemon', hex: '#EAB308' },
  { name: 'Emerald Clover', hex: '#10B981' },
  { name: 'Sky Azure', hex: '#0EA5E9' },
  { name: 'Tangerine Orange', hex: '#F97316' },
  { name: 'Midnight Charcoal', hex: '#1E293B' },
];

const STICKERS = ['⭐', '🦕', '🚀', '👑', '❤️', '🌈', '🎨', '🦁'];

export const DoodleStudio: React.FC<DoodleStudioProps> = ({
  onAddStars,
  activeTokenSnippet,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#4F46E5');
  const [isRainbow, setIsRainbow] = useState<boolean>(false);
  const [rainbowHue, setRainbowHue] = useState<number>(0);
  const [brushSize, setBrushSize] = useState<number>(8);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [savedGallery, setSavedGallery] = useState<SavedArtwork[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 720;
    canvas.height = 460;

    // Default white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial blank state
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-12), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    // If a sticker is active, stamp it instead of drawing
    if (activeSticker) {
      ctx.font = `${brushSize * 4 + 24}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(activeSticker, x, y);
      saveState();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeSticker) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isRainbow) {
      const nextHue = (rainbowHue + 3) % 360;
      setRainbowHue(nextHue);
      ctx.strokeStyle = `hsl(${nextHue}, 90%, 55%)`;
    } else {
      ctx.strokeStyle = brushColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const newArtwork: SavedArtwork = {
      id: `art-${Date.now()}`,
      dataUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Masterpiece #${savedGallery.length + 1}`,
    };

    setSavedGallery((prev) => [newArtwork, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    onAddStars(3);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981'],
      });
    } catch {
      // safe fallback
    }

    authSimulator.logAppAction('Saved Canvas Doodle', `/api/v1/kids/art/gallery`, activeTokenSnippet);
  };

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with clean unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Creative Workshop</span>
            <span aria-hidden="true">·</span>
            <span>Rainbow Canvas & Kid Stamps</span>
            <span aria-hidden="true">·</span>
            <span className="text-pink-600 font-semibold">Earn 3 Stars for Saved Art</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Doodle Studio & Refrigerator Gallery
          </h2>
        </div>

        {/* Gallery count & undo actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              history.length <= 1
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-slate-300 hover:border-slate-400 text-slate-700 bg-white cursor-pointer hover:bg-slate-50'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 text-slate-700 bg-white text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleSaveToGallery}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Pinned to Fridge! (+3★)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Pin to Refrigerator</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Toolbar: Color palette, Brush size, Stamps */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          
          {/* Colors */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Paint Color
              </span>
              <button
                onClick={() => {
                  setIsRainbow(!isRainbow);
                  setActiveSticker(null);
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  isRainbow
                    ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-indigo-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🌈 Rainbow Mode
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {BRUSH_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => {
                    setBrushColor(col.hex);
                    setIsRainbow(false);
                    setActiveSticker(null);
                  }}
                  className={`w-11 h-11 rounded-xl transition-transform cursor-pointer relative flex items-center justify-center ${
                    brushColor === col.hex && !isRainbow && !activeSticker
                      ? 'scale-110 ring-3 ring-indigo-500/40 shadow-sm'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {brushColor === col.hex && !isRainbow && !activeSticker && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Brush Thickness
              </span>
              <span className="font-mono text-slate-700 font-bold">{brushSize}px</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 28].map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    brushSize === size
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="rounded-full bg-slate-800"
                    style={{ width: `${Math.min(20, Math.max(4, size * 0.8))}px`, height: `${Math.min(20, Math.max(4, size * 0.8))}px` }}
                  />
                  <span className="text-[10px]">{size <= 6 ? 'Fine' : size <= 10 ? 'Medium' : size <= 18 ? 'Chunky' : 'Giant'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fun Stamps */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Stamp Stickers
              </span>
              {activeSticker && (
                <button
                  onClick={() => setActiveSticker(null)}
                  className="text-indigo-600 hover:underline cursor-pointer"
                >
                  Clear Sticker
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {STICKERS.map((stk) => (
                <button
                  key={stk}
                  onClick={() => {
                    setActiveSticker(activeSticker === stk ? null : stk);
                    setIsRainbow(false);
                  }}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                    activeSticker === stk
                      ? 'border-pink-500 bg-pink-50 scale-110 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  title={`Stamp ${stk}`}
                >
                  {stk}
                </button>
              ))}
            </div>
            {activeSticker && (
              <p className="text-[11px] text-pink-700 bg-pink-50 p-2 rounded-lg text-center font-medium">
                Tap anywhere on canvas to stamp {activeSticker}!
              </p>
            )}
          </div>

        </div>

        {/* Center Canvas Stage */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-200 p-2 sm:p-3 rounded-2xl border border-slate-300 shadow-inner flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className="bg-white rounded-xl shadow-xs cursor-crosshair touch-none w-full max-w-full aspect-[720/460]"
            />
          </div>

          {/* Saved Refrigerator Gallery */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 font-display">
                  Family Refrigerator Gallery
                </h4>
                <p className="text-xs text-slate-500">
                  {savedGallery.length === 0
                    ? 'No drawings pinned yet. Paint something and click "Pin to Refrigerator"!'
                    : `${savedGallery.length} masterpieces pinned with pride`}
                </p>
              </div>
            </div>

            {savedGallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {savedGallery.map((art) => (
                  <div
                    key={art.id}
                    className="group relative bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 shadow-xs space-y-1.5"
                  >
                    {/* Simulated fridge magnet */}
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm mx-auto -mt-4 ring-2 ring-white" />
                    <img
                      src={art.dataUrl}
                      alt={art.title}
                      className="w-full aspect-[4/3] object-cover rounded-lg bg-white border border-slate-200"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium px-1">
                      <span className="truncate">{art.title}</span>
                      <span className="font-mono text-slate-400">{art.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
