import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  History, 
  Sparkles, 
  Radio, 
  Gauge
} from 'lucide-react';
import { RadarFrame } from '../types';

interface TimelineControllerProps {
  mode: 'past' | 'future';
  onChangeMode: (mode: 'past' | 'future') => void;
  pastFrames: RadarFrame[];
  futureFrames: RadarFrame[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playSpeedMs: number;
  onChangeSpeed: (speedMs: number) => void;
  onStep: (forward: boolean) => void;
  onResetToLive: () => void;
}

const SPEED_OPTIONS = [
  { label: '0.5x', ms: 1200 },
  { label: '1.0x', ms: 650 },
  { label: '1.5x', ms: 450 },
  { label: '2.0x', ms: 300 },
  { label: '3.0x', ms: 180 },
];

export const TimelineController: React.FC<TimelineControllerProps> = ({
  mode,
  onChangeMode,
  pastFrames,
  futureFrames,
  currentIndex,
  onSelectIndex,
  isPlaying,
  onTogglePlay,
  playSpeedMs,
  onChangeSpeed,
  onStep,
  onResetToLive,
}) => {
  const currentFrames = mode === 'past' ? pastFrames : futureFrames;
  
  if (currentFrames.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(0, currentIndex), currentFrames.length - 1);
  const currentFrame = currentFrames[safeIndex] || currentFrames[0];
  const isLive = currentFrame.type === 'present';
  const isPast = mode === 'past';
  const isFuture = mode === 'future';

  const firstFrame = currentFrames[0];
  const lastFrame = currentFrames[currentFrames.length - 1];

  const progressPercent = (safeIndex / Math.max(1, currentFrames.length - 1)) * 100;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(940px,calc(100vw-24px))] z-[1000] pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-3.5 sm:p-4 text-slate-100 ring-1 ring-black/50">
        
        {/* Top Header: Mode Switcher Buttons (Past / Future) + Live Marker + Frame Info */}
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap sm:flex-nowrap">
          
          {/* Left: Dedicated Mode Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/10 shadow-inner">
            {/* Past Mode Button */}
            <button
              id="btn-mode-past"
              onClick={() => onChangeMode('past')}
              title="Switch scroll bar to Past Radar observations (Last 2 Hours)"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                isPast
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Radar (2h)</span>
            </button>

            {/* Jump to LIVE Button */}
            <button
              id="btn-jump-live"
              onClick={onResetToLive}
              title="Jump directly to Current Live Doppler scan"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
              <span>LIVE</span>
            </button>

            {/* Future Mode Button */}
            <button
              id="btn-mode-future"
              onClick={() => onChangeMode('future')}
              title="Switch scroll bar to Predictive Future Track (Next 6 Hours)"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                isFuture
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 border border-amber-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Future Track (6h)</span>
            </button>
          </div>

          {/* Right: Active Frame Timestamp & Offset Display */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Status Pill */}
            {isLive ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wide">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Observation</span>
              </div>
            ) : isPast ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wide">
                <History className="w-3.5 h-3.5" />
                <span>Past History</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Future Model</span>
              </div>
            )}

            {/* Clock Time & Relative Offset */}
            <div className="text-right">
              <div className="font-mono text-base sm:text-lg font-bold text-white leading-none">
                {currentFrame.formattedTime}
              </div>
              <div className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                {currentFrame.relativeLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Dedicated Animation Scroll Bar for Selected Mode */}
        <div className="relative pt-1 pb-1">
          {/* Visual Track Bar */}
          <div className="relative h-3.5 w-full rounded-full overflow-hidden flex bg-slate-950 border border-white/15 shadow-inner">
            {/* Filled Progress Track */}
            <div
              style={{ width: `${progressPercent}%` }}
              className={`h-full transition-all duration-75 ${
                isPast
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
              }`}
            />
          </div>

          {/* Transparent Range Input Slider */}
          <input
            id="timeline-range-slider"
            type="range"
            min={0}
            max={currentFrames.length - 1}
            value={safeIndex}
            onChange={(e) => onSelectIndex(parseInt(e.target.value, 10))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            aria-label={`${isPast ? 'Past radar' : 'Future forecast'} timeline scrubber`}
          />

          {/* Custom Slider Thumb Handle */}
          <div
            style={{
              left: `${progressPercent}%`,
            }}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 shadow-xl pointer-events-none z-10 flex items-center justify-center transition-all duration-75 ${
              isPast ? 'border-blue-500 shadow-blue-500/50' : 'border-amber-500 shadow-amber-500/50'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-blue-600' : 'bg-amber-600'}`} />
          </div>

          {/* Ticks and Start/End Boundary Labels for Selected Mode */}
          <div className="flex justify-between items-center mt-2 px-1 text-[11px] font-medium">
            {/* Start of selected mode */}
            <span className={`flex items-center gap-1 ${isPast ? 'text-blue-300' : 'text-emerald-300'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-blue-400' : 'bg-emerald-400'}`} />
              <span>{firstFrame?.formattedTime}</span>
              <span className="text-slate-400">({firstFrame?.relativeLabel})</span>
            </span>

            {/* Mode Frame Counter & Resolution */}
            <span className="text-slate-400 text-[10.5px]">
              Frame {safeIndex + 1} of {currentFrames.length} ({isPast ? 'Past 2h Radar' : '6h Future Horizon'})
            </span>

            {/* End of selected mode */}
            <span className={`flex items-center gap-1 ${isPast ? 'text-emerald-300' : 'text-amber-300'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{lastFrame?.formattedTime}</span>
              <span className="text-slate-400">({lastFrame?.relativeLabel})</span>
            </span>
          </div>
        </div>

        {/* Bottom Row: Playback Controls (Play, Step, Speed) */}
        <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-white/10">
          
          <div className="flex items-center gap-2">
            {/* Step Back */}
            <button
              id="btn-step-prev"
              onClick={() => onStep(false)}
              title={`Step to previous ${isPast ? 'past' : 'future'} frame`}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors active:scale-95"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Loop */}
            <button
              id="btn-play-pause"
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause loop' : `Play ${isPast ? 'past radar' : 'future track'} loop`}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                  : isPast
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play {isPast ? 'Past Loop' : 'Future Loop'}</span>
                </>
              )}
            </button>

            {/* Step Forward */}
            <button
              id="btn-step-next"
              onClick={() => onStep(true)}
              title={`Step to next ${isPast ? 'past' : 'future'} frame`}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors active:scale-95"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Playback Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-white/10 text-xs">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
            <span className="hidden md:inline text-slate-400 text-[11px] mr-1">Speed:</span>
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.ms}
                onClick={() => onChangeSpeed(opt.ms)}
                className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                  playSpeedMs === opt.ms
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
