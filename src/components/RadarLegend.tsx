import React from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';

interface RadarLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RadarLegend: React.FC<RadarLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-3 sm:right-16 w-72 z-[1000] bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-4 text-slate-100 divide-y divide-white/10 pointer-events-auto">
      <div className="flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          <h3 className="font-bold text-sm text-white">Precipitation Scale</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-2 text-xs">
        {/* Continuous Color Gradient Bar */}
        <div>
          <div className="h-3.5 w-full rounded-md bg-gradient-to-r from-[#00c8ff] via-[#00e000] via-[#ffff00] via-[#ff9000] via-[#ff0000] to-[#b000b0] border border-white/10 shadow-sm" />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>5 dBZ</span>
            <span>25 dBZ</span>
            <span>40 dBZ</span>
            <span>55 dBZ</span>
            <span>65+ dBZ</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#00c8ff]" />
              <span className="text-slate-200">Light Rain / Drizzle</span>
            </div>
            <span className="font-mono text-slate-400">&lt; 2.5 mm/h</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#00e000]" />
              <span className="text-slate-200">Moderate Rain</span>
            </div>
            <span className="font-mono text-slate-400">2.5 - 7.5 mm/h</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#ffff00]" />
              <span className="text-slate-200">Heavy Rain</span>
            </div>
            <span className="font-mono text-slate-400">7.5 - 15 mm/h</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#ff0000]" />
              <span className="text-slate-200">Intense Downpour</span>
            </div>
            <span className="font-mono text-slate-400">15 - 50 mm/h</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#b000b0]" />
              <span className="text-slate-200">Severe / Hail</span>
            </div>
            <span className="font-mono text-slate-400">&gt; 50 mm/h</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#e879f9]" />
              <span className="text-purple-300 font-medium">Snow & Ice / Sleet</span>
            </div>
            <span className="font-mono text-purple-300">Frozen</span>
          </div>
        </div>
      </div>

      <div className="pt-2.5 text-[11px] text-slate-400 leading-relaxed">
        Radar reflectivity (dBZ) measures the amount of transmitted power returned to the radar receiver.
      </div>
    </div>
  );
};
