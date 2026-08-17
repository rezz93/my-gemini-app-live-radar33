export interface RadarFrame {
  id: string;
  time: number;
  path: string;
  type: 'past' | 'present' | 'future';
  relativeLabel: string;
  formattedTime: string;
  isExtrapolated?: boolean;
  forecastMinutes?: number;
}

export interface RadarDataResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: Array<{ time: number; path: string }>;
    nowcast: Array<{ time: number; path: string }>;
  };
  satellite?: {
    infrared: Array<{ time: number; path: string }>;
  };
}

export interface BaseMapStyle {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  previewBg: string;
}

export interface ColorSchemeOption {
  id: number;
  name: string;
  description: string;
}

export type TempUnit = 'F' | 'C';

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  tempUnit: TempUnit;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  windDirection: number;
  surfacePressure: number;
  hourlyPrecipitation: Array<{
    time: string;
    precipitation: number;
    probability: number;
  }>;
  dailyForecast: Array<{
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    rainProb: number;
  }>;
}

export interface LocationSearchResult {
  placeId: number | string;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type?: string;
}

export type TimelineFilterMode = 'all' | 'past' | 'future';
