import { RadarDataResponse, RadarFrame, CurrentWeather, LocationSearchResult, TempUnit } from '../types';

export const RAINVIEWER_API_URL = 'https://api.rainviewer.com/public/weather-maps.json';

export const COLOR_SCHEMES = [
  { id: 2, name: 'Universal Blue', description: 'Modern blue-to-red radar scale' },
  { id: 4, name: 'The Weather Channel', description: 'Classic TV weather color palette' },
  { id: 6, name: 'NEXRAD Level III', description: 'National Weather Service standard' },
  { id: 3, name: 'TITAN Radar', description: 'High contrast storm analysis' },
  { id: 7, name: 'Rainbow (SELEX-IS)', description: 'Full spectrum precipitation scale' },
  { id: 8, name: 'Dark Sky', description: 'Vibrant colors optimized for dark maps' },
  { id: 1, name: 'Original', description: 'Standard meteorological palette' },
  { id: 0, name: 'Black & White', description: 'Monochrome grayscale density' },
];

export const BASE_MAPS = [
  {
    id: 'carto-dark',
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    previewBg: '#12161f',
  },
  {
    id: 'carto-light',
    name: 'Positron (Light)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    previewBg: '#e8eef3',
  },
  {
    id: 'carto-voyager',
    name: 'Voyager Navigation',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    previewBg: '#2a3b4c',
  },
  {
    id: 'esri-satellite',
    name: 'Satellite Hybrid',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
    maxZoom: 18,
    previewBg: '#213028',
  },
  {
    id: 'esri-topo',
    name: 'Topography (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ',
    maxZoom: 18,
    previewBg: '#c2bc99',
  },
  {
    id: 'osm-standard',
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    previewBg: '#d8e5cc',
  },
];

export function formatTimeDifference(targetTimestamp: number, currentTimestamp: number): string {
  const diffMinutes = Math.round((targetTimestamp - currentTimestamp) / 60);
  if (Math.abs(diffMinutes) < 4) {
    return 'LIVE';
  }
  if (diffMinutes < 0) {
    const mins = Math.abs(diffMinutes);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `-${hours}h ${rem}m` : `-${hours}h`;
    }
    return `-${mins} min`;
  } else {
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      const rem = diffMinutes % 60;
      return rem > 0 ? `+${hours}h ${rem}m (Forecast)` : `+${hours}h (Forecast)`;
    }
    return `+${diffMinutes} min (Forecast)`;
  }
}

export function formatClockTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export const FORECAST_HORIZON_MINUTES = [
  15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 270, 300, 330, 360
];

export async function fetchRadarData(): Promise<{ host: string; frames: RadarFrame[]; generated: number }> {
  const response = await fetch(RAINVIEWER_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch radar data: ${response.statusText}`);
  }
  const data: RadarDataResponse = await response.json();
  const host = data.host;
  const pastList = data.radar?.past || [];
  const nowcastList = data.radar?.nowcast || [];

  if (pastList.length === 0 && nowcastList.length === 0) {
    throw new Error('No radar scan frames currently available from RainViewer.');
  }

  // The last frame of "past" or the boundary is considered "present/live"
  const presentFrame = pastList.length > 0 ? pastList[pastList.length - 1] : null;
  const nowTimestamp = presentFrame ? presentFrame.time : Math.floor(Date.now() / 1000);

  const processedFrames: RadarFrame[] = [];

  // 1. Add past observation frames (the last past frame is marked present)
  pastList.forEach((item, index) => {
    const isLatestPast = index === pastList.length - 1;
    const type = isLatestPast ? 'present' : 'past';
    processedFrames.push({
      id: `${item.path}_${item.time}`,
      time: item.time,
      path: item.path,
      type,
      relativeLabel: isLatestPast ? 'LIVE NOW' : formatTimeDifference(item.time, nowTimestamp),
      formattedTime: formatClockTime(item.time),
    });
  });

  // 2. Add 6-hour future forecast frames
  // If RainViewer provides server-side nowcast tiles, map those first; otherwise project from presentFrame
  if (presentFrame) {
    FORECAST_HORIZON_MINUTES.forEach((mins) => {
      const futureTime = presentFrame.time + mins * 60;
      // Check if RainViewer has a matching nowcast frame within 5 minutes
      const matchingNowcast = nowcastList.find(
        (nc) => Math.abs(nc.time - futureTime) <= 5 * 60
      );
      const framePath = matchingNowcast ? matchingNowcast.path : presentFrame.path;

      processedFrames.push({
        id: `forecast_${mins}m_${futureTime}`,
        time: futureTime,
        path: framePath,
        type: 'future',
        relativeLabel: formatTimeDifference(futureTime, nowTimestamp),
        formattedTime: formatClockTime(futureTime),
        isExtrapolated: true,
        forecastMinutes: mins,
      });
    });
  }

  return {
    host,
    frames: processedFrames,
    generated: data.generated,
  };
}

export function buildRadarTileUrl(
  host: string,
  path: string,
  colorScheme: number = 2,
  smooth: boolean = true,
  snow: boolean = true,
  tileSize: 256 | 512 = 256
): string {
  const smoothVal = smooth ? 1 : 0;
  const snowVal = snow ? 1 : 0;
  return `${host}${path}/${tileSize}/{z}/{x}/{y}/${colorScheme}/${smoothVal}_${snowVal}.png`;
}

// Weather code translation for Open-Meteo
const WMO_CODES: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear Sky', icon: 'Sun' },
  1: { text: 'Mainly Clear', icon: 'SunDim' },
  2: { text: 'Partly Cloudy', icon: 'CloudSun' },
  3: { text: 'Overcast', icon: 'Cloud' },
  45: { text: 'Fog', icon: 'CloudFog' },
  48: { text: 'Depositing Rime Fog', icon: 'CloudFog' },
  51: { text: 'Light Drizzle', icon: 'CloudDrizzle' },
  53: { text: 'Moderate Drizzle', icon: 'CloudDrizzle' },
  55: { text: 'Dense Drizzle', icon: 'CloudDrizzle' },
  56: { text: 'Light Freezing Drizzle', icon: 'CloudSnow' },
  57: { text: 'Dense Freezing Drizzle', icon: 'CloudSnow' },
  61: { text: 'Slight Rain', icon: 'CloudRain' },
  63: { text: 'Moderate Rain', icon: 'CloudRain' },
  65: { text: 'Heavy Rain', icon: 'CloudRain' },
  66: { text: 'Light Freezing Rain', icon: 'CloudSnow' },
  67: { text: 'Heavy Freezing Rain', icon: 'CloudSnow' },
  71: { text: 'Slight Snow Fall', icon: 'Snowflake' },
  73: { text: 'Moderate Snow Fall', icon: 'Snowflake' },
  75: { text: 'Heavy Snow Fall', icon: 'Snowflake' },
  77: { text: 'Snow Grains', icon: 'Snowflake' },
  80: { text: 'Slight Rain Showers', icon: 'CloudRain' },
  81: { text: 'Moderate Rain Showers', icon: 'CloudRain' },
  82: { text: 'Violent Rain Showers', icon: 'CloudLightning' },
  85: { text: 'Slight Snow Showers', icon: 'Snowflake' },
  86: { text: 'Heavy Snow Showers', icon: 'Snowflake' },
  95: { text: 'Thunderstorm', icon: 'CloudLightning' },
  96: { text: 'Thunderstorm with Slight Hail', icon: 'CloudLightning' },
  99: { text: 'Thunderstorm with Heavy Hail', icon: 'CloudLightning' },
};

export async function fetchCurrentWeather(lat: number, lon: number, unit: TempUnit = 'F'): Promise<CurrentWeather> {
  const tempUnitParam = unit === 'F' ? 'fahrenheit' : 'celsius';
  const windUnitParam = unit === 'F' ? 'mph' : 'kmh';
  const precipUnitParam = unit === 'F' ? 'inch' : 'mm';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=precipitation,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=${tempUnitParam}&wind_speed_unit=${windUnitParam}&precipitation_unit=${precipUnitParam}&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch current weather details');
  }
  const data = await response.json();
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  const weatherInfo = WMO_CODES[current.weather_code] || { text: 'Partly Cloudy', icon: 'Cloud' };

  // Next 12 hours
  const hourlyPrecip: CurrentWeather['hourlyPrecipitation'] = [];
  if (hourly && hourly.time) {
    const nowISO = new Date().toISOString().slice(0, 13);
    let startIndex = hourly.time.findIndex((t: string) => t.startsWith(nowISO));
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 12, hourly.time.length); i++) {
      const timeStr = hourly.time[i];
      const hourLabel = new Date(timeStr).toLocaleTimeString([], { hour: 'numeric' });
      hourlyPrecip.push({
        time: hourLabel,
        precipitation: hourly.precipitation ? hourly.precipitation[i] || 0 : 0,
        probability: hourly.precipitation_probability ? hourly.precipitation_probability[i] || 0 : 0,
      });
    }
  }

  // Next 5 days
  const dailyForecast: CurrentWeather['dailyForecast'] = [];
  if (daily && daily.time) {
    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
      const dateObj = new Date(daily.time[i]);
      const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' });
      dailyForecast.push({
        date: dayName,
        weatherCode: daily.weather_code[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        rainProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
      });
    }
  }

  return {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    tempUnit: unit,
    humidity: Math.round(current.relative_humidity_2m),
    precipitation: current.precipitation || 0,
    weatherCode: current.weather_code,
    weatherDescription: weatherInfo.text,
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: current.wind_direction_10m,
    surfacePressure: Math.round(current.surface_pressure),
    hourlyPrecipitation: hourlyPrecip,
    dailyForecast,
  };
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const trimmed = query ? query.trim() : '';
  if (!trimmed || trimmed.length < 2) return [];

  const isZip = /^\d{5}(-\d{4})?$/.test(trimmed);
  // Strictly limit to US CONUS area
  const url = isZip
    ? `https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(trimmed)}&countrycodes=us&addressdetails=1&limit=8`
    : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=us&addressdetails=1&limit=8`;
  
  try {
    let response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    let data = response.ok ? await response.json() : [];

    // Fallback to standard q if postalcode returned no direct hits
    if (isZip && (!data || data.length === 0)) {
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ' USA')}&countrycodes=us&addressdetails=1&limit=8`;
      response = await fetch(fallbackUrl, {
        headers: { 'Accept-Language': 'en' },
      });
      if (response.ok) {
        data = await response.json();
      }
    }

    // CONUS Bounds (Contiguous United States radar coverage)
    // Lat: 24.0°N to 50.0°N, Lon: -125.0°W to -66.5°W
    const conusResults = (data || []).filter((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      return !isNaN(lat) && !isNaN(lon) && lat >= 24.0 && lat <= 50.0 && lon >= -125.0 && lon <= -66.5;
    });

    return conusResults.map((item: any) => {
      const address = item.address || {};
      const city = address.city || address.town || address.village || address.municipality || address.county || '';
      const state = address.state || address.state_code || '';
      const postcode = address.postcode || (isZip ? trimmed : '');

      let name = item.name || item.display_name.split(',')[0];
      if (city && state && postcode) {
        name = `${city}, ${state} ${postcode}`;
      } else if (city && state) {
        name = `${city}, ${state}`;
      } else if (city) {
        name = city;
      }

      return {
        placeId: item.place_id,
        name: name.trim(),
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
      };
    });
  } catch (err) {
    console.error('searchLocations error:', err);
    return [];
  }
}
