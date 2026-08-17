import React from 'react';
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  X, 
  Thermometer, 
  Calendar,
  CloudLightning,
  Snowflake,
  Compass
} from 'lucide-react';
import { CurrentWeather, TempUnit } from '../types';

interface WeatherStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  weather: CurrentWeather | null;
  locationName: string;
  isLoading: boolean;
  tempUnit: TempUnit;
  onToggleTempUnit: (unit: TempUnit) => void;
}

export const WeatherStatsPanel: React.FC<WeatherStatsPanelProps> = ({
  isOpen,
  onClose,
  weather,
  locationName,
  isLoading,
  tempUnit,
  onToggleTempUnit,
}) => {
  if (!isOpen) return null;

  const isFahrenheit = tempUnit === 'F';
  const unitSymbol = isFahrenheit ? '°F' : '°C';
  const windUnit = isFahrenheit ? 'mph' : 'km/h';
  const precipUnit = isFahrenheit ? 'in/h' : 'mm/h';

  return (
    <div className="absolute top-16 right-3 w-84 sm:w-96 max-h-[calc(100vh-140px)] overflow-y-auto z-[1000] bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-4 text-slate-100 divide-y divide-white/10 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <span className="text-[10.5px] uppercase font-bold tracking-wider text-sky-400 block">
            Local Conditions
          </span>
          <h3 className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-[220px]">
            {locationName || 'Current Location'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => onToggleTempUnit('F')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                isFahrenheit
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fahrenheit"
            >
              °F
            </button>
            <button
              onClick={() => onToggleTempUnit('C')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                !isFahrenheit
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Celsius"
            >
              °C
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Fetching meteorological data...</span>
        </div>
      ) : weather ? (
        <>
          {/* Main Temp & Condition */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  {weather.temperature}°
                </span>
                <span className="text-xs font-semibold text-sky-400">{tempUnit}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium capitalize mt-0.5">
                {weather.weatherDescription}
              </p>
              <p className="text-[11px] text-slate-400">
                Feels like <span className="text-slate-200 font-semibold">{weather.feelsLike}{unitSymbol}</span>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              {weather.weatherCode >= 95 ? (
                <CloudLightning className="w-8 h-8 text-amber-400" />
              ) : weather.weatherCode >= 71 ? (
                <Snowflake className="w-8 h-8 text-purple-300" />
              ) : weather.weatherCode >= 51 ? (
                <CloudRain className="w-8 h-8 text-sky-400" />
              ) : (
                <Sun className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="py-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2.5">
              <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precipitation</span>
                <span className="font-bold text-white text-xs">{weather.precipitation} {precipUnit}</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wind Speed</span>
                <span className="font-bold text-white text-xs">{weather.windSpeed} {windUnit}</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2.5">
              <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Humidity</span>
                <span className="font-bold text-white text-xs">{weather.humidity}%</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pressure</span>
                <span className="font-bold text-white text-xs">{weather.surfacePressure} hPa</span>
              </div>
            </div>
          </div>

          {/* 12-Hour Precipitation Trend */}
          {weather.hourlyPrecipitation && weather.hourlyPrecipitation.length > 0 && (
            <div className="py-3">
              <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  Precipitation Forecast (Next 12h)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">% chance</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {weather.hourlyPrecipitation.slice(0, 6).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/80 p-1.5 rounded-lg text-center border border-white/5 flex flex-col items-center justify-between min-h-[54px]"
                  >
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden my-1">
                      <div
                        style={{ width: `${Math.min(100, item.probability)}%` }}
                        className="h-full bg-sky-400 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-sky-300">{item.probability}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5-Day Outlook */}
          {weather.dailyForecast && weather.dailyForecast.length > 0 && (
            <div className="py-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-2 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>5-Day Outlook</span>
              </div>
              <div className="space-y-1.5">
                {weather.dailyForecast.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-800/50 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <span className="w-12 font-semibold text-slate-200">{day.date}</span>
                    <div className="flex items-center gap-1 text-[11px] text-sky-300">
                      <CloudRain className="w-3 h-3" />
                      <span>{day.rainProb}%</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-white font-bold">{day.tempMax}°</span>
                      <span className="text-slate-400 ml-1.5">{day.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          Click on any location on the map to load weather stats.
        </div>
      )}
    </div>
  );
};
