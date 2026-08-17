import React from 'react';
import { 
  Layers, 
  Palette, 
  Sliders, 
  Sparkles, 
  Snowflake, 
  Map as MapIcon, 
  X, 
  Eye
} from 'lucide-react';
import { BASE_MAPS, COLOR_SCHEMES } from '../services/radarService';

interface LayerControlsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBaseMapId: string;
  onSelectBaseMap: (id: string) => void;
  colorScheme: number;
  onSelectColorScheme: (schemeId: number) => void;
  radarOpacity: number;
  onChangeOpacity: (opacity: number) => void;
  isSmooth: boolean;
  onToggleSmooth: () => void;
  isSnow: boolean;
  onToggleSnow: () => void;
  tileSize: 256 | 512;
  onChangeTileSize: (size: 256 | 512) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  isOpen,
  onClose,
  selectedBaseMapId,
  onSelectBaseMap,
  colorScheme,
  onSelectColorScheme,
  radarOpacity,
  onChangeOpacity,
  isSmooth,
  onToggleSmooth,
  isSnow,
  onToggleSnow,
  tileSize,
  onChangeTileSize,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-3 w-80 max-h-[calc(100vh-140px)] overflow-y-auto z-[1000] bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-4 text-slate-100 divide-y divide-white/10 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h3 className="font-bold text-sm text-white">Radar & Map Settings</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Base Map Selection */}
      <div className="py-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <MapIcon className="w-3.5 h-3.5 text-sky-400" />
          <span>Base Map Style</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BASE_MAPS.map((base) => (
            <button
              key={base.id}
              onClick={() => onSelectBaseMap(base.id)}
              className={`px-3 py-2 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedBaseMapId === base.id
                  ? 'bg-sky-600/25 border-sky-400 text-sky-200 ring-1 ring-sky-400/50'
                  : 'bg-slate-800/80 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: base.previewBg }}
              />
              <span className="truncate">{base.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Radar Color Palette */}
      <div className="py-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-sky-400" />
          <span>Radar Color Scheme</span>
        </label>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => onSelectColorScheme(scheme.id)}
              className={`w-full px-3 py-2 rounded-xl text-left border text-xs flex items-center justify-between transition-all ${
                colorScheme === scheme.id
                  ? 'bg-sky-600/25 border-sky-400 text-white font-bold'
                  : 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
              }`}
            >
              <div>
                <span className="block">{scheme.name}</span>
                <span className="text-[10px] text-slate-400 block font-normal">{scheme.description}</span>
              </div>
              {colorScheme === scheme.id && (
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity & Processing Filters */}
      <div className="py-3 space-y-3">
        {/* Opacity */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-slate-300 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              Radar Layer Opacity
            </span>
            <span className="font-mono text-sky-300 font-bold">
              {Math.round(radarOpacity * 100)}%
            </span>
          </div>
          <input
            id="radar-opacity-slider"
            type="range"
            min={20}
            max={100}
            value={Math.round(radarOpacity * 100)}
            onChange={(e) => onChangeOpacity(parseInt(e.target.value, 10) / 100)}
            className="w-full accent-sky-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Smooth Filter */}
        <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Smooth Radar</span>
              <span className="text-[10.5px] text-slate-400 block">Bilinear interpolation</span>
            </div>
          </div>
          <button
            onClick={onToggleSmooth}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isSmooth ? 'bg-sky-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isSmooth ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Snow Detection */}
        <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Detect Snow & Ice</span>
              <span className="text-[10.5px] text-slate-400 block">Highlights frozen precipitation</span>
            </div>
          </div>
          <button
            onClick={onToggleSnow}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isSnow ? 'bg-purple-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isSnow ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Tile Resolution */}
        <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-white/5">
          <div>
            <span className="text-xs font-semibold text-white block">Tile Quality</span>
            <span className="text-[10.5px] text-slate-400 block">Standard (256px) or HD (512px)</span>
          </div>
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => onChangeTileSize(256)}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                tileSize === 256 ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              256px
            </button>
            <button
              onClick={() => onChangeTileSize(512)}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                tileSize === 512 ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              512 HD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
