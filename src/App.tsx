/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RadarFrame, TimelineFilterMode, CurrentWeather, TempUnit } from './types';
import { 
  fetchRadarData, 
  fetchCurrentWeather 
} from './services/radarService';
import { Navbar } from './components/Navbar';
import { RadarMap } from './components/RadarMap';
import { TimelineController } from './components/TimelineController';
import { LayerControls } from './components/LayerControls';
import { WeatherStatsPanel } from './components/WeatherStatsPanel';
import { RadarLegend } from './components/RadarLegend';
import { ExportModal } from './components/ExportModal';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function App() {
  // Radar data state
  const [radarHost, setRadarHost] = useState<string>('');
  const [allFrames, setAllFrames] = useState<RadarFrame[]>([]);
  const [timelineMode, setTimelineMode] = useState<'past' | 'future'>('past');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);
  const [radarError, setRadarError] = useState<string | null>(null);

  // Derived frames for Past (2h) and Future (6h)
  const pastFrames = React.useMemo(() => {
    return allFrames.filter((f) => f.type === 'past' || f.type === 'present');
  }, [allFrames]);

  const futureFrames = React.useMemo(() => {
    return allFrames.filter((f) => f.type === 'present' || f.type === 'future');
  }, [allFrames]);

  const activeFrames = timelineMode === 'past' ? pastFrames : futureFrames;

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeedMs, setPlaySpeedMs] = useState<number>(650);

  // Map & layer settings
  const [selectedBaseMapId, setSelectedBaseMapId] = useState<string>('carto-dark');
  const [colorScheme, setColorScheme] = useState<number>(2); // Universal Blue default
  const [isSmooth, setIsSmooth] = useState<boolean>(true);
  const [isSnow, setIsSnow] = useState<boolean>(true);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.85);
  const [tileSize, setTileSize] = useState<256 | 512>(256);

  // Geo Location & Weather
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Continental US
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [tempUnit, setTempUnit] = useState<TempUnit>('F');

  // UI Panels
  const [showLayerControls, setShowLayerControls] = useState<boolean>(false);
  const [showWeatherStats, setShowWeatherStats] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Animation interval reference
  const animationTimerRef = useRef<number | null>(null);

  // 1. Fetch Radar Scan Frames
  const loadRadar = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingRadar(true);
    setRadarError(null);
    try {
      const data = await fetchRadarData();
      setRadarHost(data.host);
      setAllFrames(data.frames);
    } catch (err: any) {
      console.error('Failed to load radar data', err);
      setRadarError(err.message || 'Unable to connect to live radar server.');
    } finally {
      if (!quiet) setIsLoadingRadar(false);
    }
  }, []);

  useEffect(() => {
    loadRadar();

    // Auto-refresh radar data every 5 minutes
    const interval = setInterval(() => {
      loadRadar(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadRadar]);

  // Default to the present / live frame upon initial data load
  useEffect(() => {
    if (pastFrames.length > 0 && timelineMode === 'past') {
      setCurrentIndex(pastFrames.length - 1); // Live frame is last in past
    }
  }, [pastFrames.length]);

  // Mode change handler
  const handleSwitchTimelineMode = (newMode: 'past' | 'future') => {
    setIsPlaying(false);
    setTimelineMode(newMode);
    if (newMode === 'past') {
      setCurrentIndex(Math.max(0, pastFrames.length - 1)); // Jump to LIVE
    } else {
      setCurrentIndex(0); // Jump to LIVE (first frame of future)
    }
  };

  // 3. Playback Animation Engine
  useEffect(() => {
    if (!isPlaying || activeFrames.length <= 1) {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      return;
    }

    animationTimerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeFrames.length);
    }, playSpeedMs);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, [isPlaying, activeFrames.length, playSpeedMs]);

  // Step backward / forward
  const handleStep = (forward: boolean) => {
    setIsPlaying(false);
    if (activeFrames.length === 0) return;
    if (forward) {
      setCurrentIndex((prev) => (prev + 1) % activeFrames.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + activeFrames.length) % activeFrames.length);
    }
  };

  // Jump directly to LIVE / Present frame
  const handleResetToLive = () => {
    setIsPlaying(false);
    if (timelineMode === 'past') {
      const presentIdx = pastFrames.findIndex((f) => f.type === 'present');
      setCurrentIndex(presentIdx !== -1 ? presentIdx : Math.max(0, pastFrames.length - 1));
    } else {
      const presentIdx = futureFrames.findIndex((f) => f.type === 'present');
      setCurrentIndex(presentIdx !== -1 ? presentIdx : 0);
    }
  };

  // 4. Fetch Weather Data for coordinates
  const loadWeatherForLocation = useCallback(async (lat: number, lon: number, name?: string, unit: TempUnit = tempUnit) => {
    setIsLoadingWeather(true);
    try {
      const weather = await fetchCurrentWeather(lat, lon, unit);
      setWeatherData(weather);
      setSelectedLocation({ lat, lon, name: name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` });
      setShowWeatherStats(true);
    } catch (err) {
      console.error('Weather fetch error', err);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [tempUnit]);

  const handleToggleTempUnit = (unit: TempUnit) => {
    setTempUnit(unit);
    if (selectedLocation) {
      loadWeatherForLocation(selectedLocation.lat, selectedLocation.lon, selectedLocation.name, unit);
    }
  };

  // Map Click Handler
  const handleMapClick = (lat: number, lon: number) => {
    loadWeatherForLocation(lat, lon);
  };

  // Location Selection from Search
  const handleSelectLocation = (lat: number, lon: number, name: string) => {
    setMapCenter([lat, lon]);
    setMapZoom(9);
    loadWeatherForLocation(lat, lon, name);
  };

  // GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(9);
        loadWeatherForLocation(latitude, longitude, 'My Location');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed or denied', err);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const activeFrame = activeFrames[currentIndex] || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Top Navbar */}
      <Navbar
        onSelectLocation={handleSelectLocation}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        filterMode={timelineMode}
        onFilterModeChange={handleSwitchTimelineMode}
        onToggleLayerControls={() => {
          setShowLayerControls((prev) => !prev);
          setShowWeatherStats(false);
          setShowLegend(false);
        }}
        showLayerControls={showLayerControls}
        onToggleWeatherStats={() => {
          setShowWeatherStats((prev) => !prev);
          setShowLayerControls(false);
          setShowLegend(false);
        }}
        showWeatherStats={showWeatherStats}
        onToggleLegend={() => {
          setShowLegend((prev) => !prev);
          setShowLayerControls(false);
          setShowWeatherStats(false);
        }}
        showLegend={showLegend}
        onOpenExportModal={() => setShowExportModal(true)}
        activeLocationName={selectedLocation?.name || ''}
      />

      {/* Main Interactive Map */}
      <RadarMap
        activeFrame={activeFrame}
        frames={activeFrames}
        radarHost={radarHost}
        selectedBaseMapId={selectedBaseMapId}
        colorScheme={colorScheme}
        isSmooth={isSmooth}
        isSnow={isSnow}
        radarOpacity={radarOpacity}
        tileSize={tileSize}
        center={mapCenter}
        zoom={mapZoom}
        onMapClick={handleMapClick}
        selectedLocation={selectedLocation}
        windSpeed={weatherData?.windSpeed}
        windDirection={weatherData?.windDirection}
      />

      {/* Bottom Timeline Controller */}
      <TimelineController
        mode={timelineMode}
        onChangeMode={handleSwitchTimelineMode}
        pastFrames={pastFrames}
        futureFrames={futureFrames}
        currentIndex={currentIndex}
        onSelectIndex={(idx) => {
          setIsPlaying(false);
          setCurrentIndex(idx);
        }}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        playSpeedMs={playSpeedMs}
        onChangeSpeed={setPlaySpeedMs}
        onStep={handleStep}
        onResetToLive={handleResetToLive}
      />

      {/* Side Panels */}
      <LayerControls
        isOpen={showLayerControls}
        onClose={() => setShowLayerControls(false)}
        selectedBaseMapId={selectedBaseMapId}
        onSelectBaseMap={setSelectedBaseMapId}
        colorScheme={colorScheme}
        onSelectColorScheme={setColorScheme}
        radarOpacity={radarOpacity}
        onChangeOpacity={setRadarOpacity}
        isSmooth={isSmooth}
        onToggleSmooth={() => setIsSmooth((prev) => !prev)}
        isSnow={isSnow}
        onToggleSnow={() => setIsSnow((prev) => !prev)}
        tileSize={tileSize}
        onChangeTileSize={setTileSize}
      />

      <WeatherStatsPanel
        isOpen={showWeatherStats}
        onClose={() => setShowWeatherStats(false)}
        weather={weatherData}
        locationName={selectedLocation?.name || ''}
        isLoading={isLoadingWeather}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
      />

      <RadarLegend
        isOpen={showLegend}
        onClose={() => setShowLegend(false)}
      />

      {/* Standalone HTML File Export Dialog */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Initial Loading Overlay */}
      {isLoadingRadar && (
        <div className="absolute inset-0 z-[1500] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-100">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            <div className="absolute w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-sm font-bold tracking-tight text-white">
            Connecting to Live Weather Radar Feed...
          </p>
          <span className="text-xs text-slate-400">Loading Doppler sweeps (Past 2h, Present, Nowcast)</span>
        </div>
      )}

      {/* Error Banner */}
      {radarError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1500] bg-red-950/90 border border-red-500/50 rounded-xl px-4 py-3 text-red-200 shadow-2xl flex items-center gap-3 max-w-md">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-red-100">Radar Feed Notice</span>
            <span>{radarError}</span>
          </div>
          <button
            onClick={() => loadRadar()}
            className="ml-auto p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
