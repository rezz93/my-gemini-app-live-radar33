import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudRain, 
  Search, 
  MapPin, 
  Download, 
  Layers, 
  Info, 
  BarChart3, 
  X, 
  Loader2, 
  Compass,
  FileCode2,
  Check
} from 'lucide-react';
import { LocationSearchResult, TimelineFilterMode } from '../types';
import { searchLocations } from '../services/radarService';

interface NavbarProps {
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  filterMode: TimelineFilterMode;
  onFilterModeChange: (mode: TimelineFilterMode) => void;
  onToggleLayerControls: () => void;
  showLayerControls: boolean;
  onToggleWeatherStats: () => void;
  showWeatherStats: boolean;
  onToggleLegend: () => void;
  showLegend: boolean;
  onOpenExportModal: () => void;
  activeLocationName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectLocation,
  onLocateMe,
  isLocating,
  filterMode,
  onFilterModeChange,
  onToggleLayerControls,
  showLayerControls,
  onToggleWeatherStats,
  showWeatherStats,
  onToggleLegend,
  showLegend,
  onOpenExportModal,
  activeLocationName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result: LocationSearchResult) => {
    onSelectLocation(result.lat, result.lon, result.name);
    setSearchQuery(result.name);
    setShowDropdown(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
      } else if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchLocations(searchQuery.trim());
          if (results.length > 0) {
            handleSelectResult(results[0]);
          }
        } catch (err) {
          console.error('Enter search failed', err);
        } finally {
          setIsSearching(false);
        }
      }
    }
  };

  return (
    <header className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
      {/* Brand & Mode Badges */}
      <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2.5 text-slate-100">
          <div className="relative flex items-center justify-center">
            <CloudRain className="w-5 h-5 text-sky-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm tracking-tight text-white">Live Radar</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                HD Doppler
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-medium truncate max-w-[170px] sm:max-w-none">
              {activeLocationName || 'Global Weather Scan'}
            </p>
          </div>
        </div>

        {/* Timeline Quick Filter Tabs */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 p-1 rounded-xl shadow-xl flex items-center gap-1">
          <button
            id="tab-mode-past"
            onClick={() => onFilterModeChange('past')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              filterMode === 'past'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Past Radar (2h)</span>
          </button>
          <button
            id="tab-mode-future"
            onClick={() => onFilterModeChange('future')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              filterMode === 'future'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Future Track (6h)</span>
          </button>
        </div>
      </div>

      {/* Center/Right: Search Bar & Actions */}
      <div className="flex items-center gap-2 pointer-events-auto w-full md:w-auto justify-end">
        {/* Search Input Container */}
        <div ref={dropdownRef} className="relative flex-1 md:w-72 lg:w-80">
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-xl shadow-xl px-3 py-1.5 flex items-center gap-2 text-slate-200 focus-within:border-sky-400 transition-colors">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <input
              id="search-location-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Search city, state or ZIP code..."
              className="bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-400 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="btn-gps-locate"
              onClick={onLocateMe}
              disabled={isLocating}
              title="Locate my position (GPS)"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors border border-white/10 shrink-0"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden z-[1050] max-h-64 overflow-y-auto divide-y divide-white/5">
              {searchResults.map((item) => (
                <button
                  key={item.placeId}
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-sky-600/20 text-xs sm:text-sm text-slate-200 hover:text-white flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div className="truncate">
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {item.displayName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Toggle Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Weather Details Toggle */}
          <button
            id="btn-toggle-weather"
            onClick={onToggleWeatherStats}
            title="Toggle Weather Conditions Panel"
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              showWeatherStats
                ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                : 'bg-slate-900/90 border-white/15 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Layers & Palette Toggle */}
          <button
            id="btn-toggle-layers"
            onClick={onToggleLayerControls}
            title="Radar Layers & Map Styles"
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              showLayerControls
                ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                : 'bg-slate-900/90 border-white/15 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Legend Toggle */}
          <button
            id="btn-toggle-legend"
            onClick={onToggleLegend}
            title="Precipitation Intensity Legend"
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              showLegend
                ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                : 'bg-slate-900/90 border-white/15 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Standalone HTML Export Modal Trigger */}
          <button
            id="btn-export-html"
            onClick={onOpenExportModal}
            title="Download Standalone HTML File"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs border border-emerald-400/40 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <FileCode2 className="w-4 h-4" />
            <span className="hidden sm:inline">Standalone .HTML</span>
          </button>
        </div>
      </div>
    </header>
  );
};
