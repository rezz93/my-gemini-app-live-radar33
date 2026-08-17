export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Weather Radar — Past, Present & Future</title>
  
  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
    }
    #map {
      width: 100%;
      height: 100%;
      z-index: 10;
      background: #0b0f19;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    /* Glass Panels */
    .glass-panel {
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.6);
    }
    /* Controls Header */
    .top-bar {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      pointer-events: none;
    }
    .interactive {
      pointer-events: auto;
    }
    /* Timeline Scrub Bar */
    .timeline-dock {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: min(920px, calc(100vw - 32px));
      z-index: 1000;
      border-radius: 16px;
      padding: 14px 20px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(30, 41, 59, 0.85);
      color: #f8fafc;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }
    .btn:hover {
      background: rgba(51, 65, 85, 0.95);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .btn-primary {
      background: #2563eb;
      border-color: #3b82f6;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-radius: 20px;
    }
    .pill-past { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
    .pill-present { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); animation: pulseLive 2s infinite; }
    .pill-future { background: rgba(245, 158, 11, 0.25); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4); }

    @keyframes pulseLive {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.02); }
    }

    /* Floating Legend & Side Drawer */
    .legend-dock {
      position: absolute;
      top: 80px;
      right: 16px;
      z-index: 1000;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 12px;
      width: 220px;
    }
    .side-tools {
      position: absolute;
      top: 80px;
      left: 16px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Custom Range Slider */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 8px;
      cursor: pointer;
      background: rgba(51, 65, 85, 0.7);
      border-radius: 4px;
    }
    input[type=range]::-webkit-slider-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #38bdf8;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: -6px;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
      border: 2px solid #ffffff;
    }

    /* Search dropdown */
    .search-item {
      padding: 8px 10px;
      font-size: 12.5px;
      color: #f1f5f9;
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      transition: background 0.15s ease;
    }
    .search-item:hover, .search-item.active {
      background: rgba(59, 130, 246, 0.35);
    }
    .search-item-main {
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .search-item-sub {
      font-size: 11px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 18px;
    }

    /* Custom Leaflet Dark adjustments */
    .leaflet-bar a {
      background-color: rgba(15, 23, 42, 0.85) !important;
      color: #f1f5f9 !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }
    .leaflet-bar a:hover {
      background-color: rgba(30, 41, 59, 0.95) !important;
    }
    .leaflet-container {
      font-family: inherit;
    }
    .radar-tile {
      will-change: opacity, transform;
    }
  </style>
</head>
<body>

  <!-- Main Leaflet Map -->
  <div id="map"></div>

  <!-- Top App Navigation -->
  <div class="top-bar">
    <div class="interactive glass-panel" style="border-radius: 12px; padding: 8px 14px; display: flex; align-items: center; gap: 10px;">
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></div>
      <span style="font-weight: 700; font-size: 15px; letter-spacing: -0.01em;">Live Weather Radar</span>
      <span style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px; color: #94a3b8;">HD Doppler</span>
    </div>

    <!-- Search Box with Live Autocomplete Dropdown -->
    <div style="position: relative;" class="interactive">
      <div class="glass-panel" style="border-radius: 12px; padding: 4px 10px; display: flex; align-items: center; gap: 8px; width: min(340px, 48vw);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input id="city-search" type="text" placeholder="Search city, state or ZIP..." style="background: transparent; border: none; color: #fff; font-size: 13px; width: 100%; outline: none;" autocomplete="off" />
        <button id="btn-search-clear" style="display: none; background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 2px; align-items: center; justify-content: center;" title="Clear search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <button id="btn-gps" class="btn" style="padding: 4px 8px; font-size: 11px; margin-left: 2px;" title="My GPS Location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 2 15 8 12 6 9 8 12 2"></polygon></svg>
        </button>
      </div>
      <div id="search-dropdown" class="glass-panel" style="display: none; position: absolute; top: calc(100% + 6px); left: 0; width: 100%; max-height: 280px; overflow-y: auto; border-radius: 12px; z-index: 2000; box-shadow: 0 16px 32px rgba(0,0,0,0.6); padding: 4px;"></div>
    </div>
  </div>

  <!-- Left Tools (Layer, Color scheme, Opacity) -->
  <div class="side-tools">
    <div class="glass-panel" style="border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px; width: 200px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Base Map</div>
      <select id="select-basemap" class="btn" style="width: 100%; font-size: 12px; text-align: left; padding: 6px 8px;">
        <option value="carto-dark" selected>Dark Matter (Default)</option>
        <option value="carto-light">Positron Light</option>
        <option value="carto-voyager">Voyager Navigation</option>
        <option value="esri-satellite">Satellite Imagery</option>
        <option value="esri-topo">Topography (Esri)</option>
        <option value="osm-standard">OpenStreetMap</option>
      </select>

      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-top: 4px;">Radar Palette</div>
      <select id="select-colorscheme" class="btn" style="width: 100%; font-size: 12px; text-align: left; padding: 6px 8px;">
        <option value="2">Universal Blue</option>
        <option value="4">Weather Channel</option>
        <option value="6">NEXRAD Level III</option>
        <option value="3">TITAN Radar</option>
        <option value="7">Rainbow (SELEX)</option>
        <option value="8">Dark Sky</option>
        <option value="1">Original</option>
        <option value="0">Black & White</option>
      </select>

      <div style="margin-top: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
          <span>Radar Opacity</span>
          <span id="opacity-val" class="mono">85%</span>
        </div>
        <input type="range" id="slider-opacity" min="20" max="100" value="85" />
      </div>

      <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
        <input type="checkbox" id="chk-smooth" checked style="accent-color: #38bdf8; cursor: pointer;" />
        <label for="chk-smooth" style="font-size: 12px; cursor: pointer; user-select: none;">Smooth Filter</label>
      </div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <input type="checkbox" id="chk-snow" checked style="accent-color: #a855f7; cursor: pointer;" />
        <label for="chk-snow" style="font-size: 12px; cursor: pointer; user-select: none;">Detect Snow</label>
      </div>
    </div>
  </div>

  <!-- Legend Dock -->
  <div class="legend-dock glass-panel">
    <div style="font-weight: 700; font-size: 12px; margin-bottom: 6px; display: flex; justify-content: space-between;">
      <span>Precipitation (dBZ)</span>
      <span style="color: #94a3b8; font-size: 10px;">mm/h</span>
    </div>
    <!-- Color Bar Gradient -->
    <div style="height: 10px; border-radius: 5px; background: linear-gradient(to right, #00f0ff, #0070ff, #00e000, #ffff00, #ff9000, #ff0000, #b000b0); margin-bottom: 6px;"></div>
    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;" class="mono">
      <span>Light (5)</span>
      <span>Mod (30)</span>
      <span>Heavy (50+)</span>
    </div>
    <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 6px; font-size: 10px; color: #cbd5e1;">
      <div style="width: 8px; height: 8px; border-radius: 2px; background: #e879f9;"></div>
      <span>Pink/Purple highlights snow/ice</span>
    </div>
  </div>

  <!-- Bottom Timeline Playback Controller -->
  <div class="timeline-dock glass-panel">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; flex-wrap: wrap;">
      
      <!-- Playback Buttons -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-prev" class="btn" title="Step Back 1 Frame">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
        </button>
        <button id="btn-play" class="btn btn-primary" style="padding: 8px 18px;" title="Play / Pause Animation">
          <svg id="icon-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <svg id="icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          <span id="play-text">Play</span>
        </button>
        <button id="btn-next" class="btn" title="Step Forward 1 Frame">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
        </button>

        <!-- Speed Selector -->
        <select id="select-speed" class="btn" style="padding: 6px 8px; font-size: 11px;">
          <option value="1200">0.5x</option>
          <option value="650" selected>1.0x</option>
          <option value="350">2.0x</option>
          <option value="180">3.0x</option>
        </select>
      </div>

      <!-- Current Timestamp & Pill -->
      <div style="display: flex; align-items: center; gap: 10px;">
        <span id="frame-pill" class="pill pill-present">LIVE NOW</span>
        <span id="frame-time" class="mono" style="font-size: 15px; font-weight: 700; letter-spacing: -0.01em;">--:-- --</span>
      </div>

      <!-- Timeline Mode Switcher Buttons (Past / Live / Future) -->
      <div style="display: flex; gap: 4px; background: rgba(0,0,0,0.4); padding: 3px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12);">
        <button id="mode-past" class="btn" style="padding: 5px 12px; font-size: 12px; font-weight: 700; background: #2563eb; color: #fff;">Past (2h)</button>
        <button id="btn-live-jump" class="btn" style="padding: 5px 10px; font-size: 12px; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.4);">● LIVE</button>
        <button id="mode-future" class="btn" style="padding: 5px 12px; font-size: 12px; font-weight: 700; background: transparent; color: #94a3b8;">Future (6h)</button>
      </div>
    </div>

    <!-- Timeline Scrubber Track -->
    <div style="position: relative; width: 100%; height: 24px; display: flex; align-items: center;">
      <div id="timeline-track" style="position: absolute; left: 0; right: 0; height: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.9); display: flex; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); pointer-events: none;">
        <div id="track-fill" style="width: 100%; background: linear-gradient(to right, #2563eb, #38bdf8, #10b981); transition: width 0.1s ease;"></div>
      </div>
      <input type="range" id="timeline-slider" min="0" max="0" value="0" style="position: relative; z-index: 2;" />
    </div>

    <!-- Timeline Labels -->
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 600;">
      <span id="label-start">-2 Hours (Past)</span>
      <span id="label-mid" style="color: #64748b; font-size: 10.5px;">Scrub to animate frames</span>
      <span id="label-end">LIVE Doppler</span>
    </div>
  </div>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

  <script>
    (function() {
      // Configuration & State
      let map;
      let baseTileLayer;
      let radarData = null;
      let allFrames = [];
      let visibleFrames = [];
      let currentFrameIndex = 0;
      let isPlaying = false;
      let playInterval = null;
      let playSpeedMs = 650;
      let filterMode = 'all'; // 'all' | 'past' | 'future'
      let colorScheme = 2;
      let isSmooth = true;
      let isSnow = true;
      let radarOpacity = 0.85;
      let radarLayersCache = {}; // path -> L.TileLayer
      let searchPinMarker = null;

      const BASE_MAP_URLS = {
        'carto-dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'carto-light': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'carto-voyager': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'esri-satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'esri-topo': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        'osm-standard': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      };

      // Initialize Map
      function initMap() {
        // Default center: continental US / Kansas or global
        map = L.map('map', {
          center: [39.8283, -98.5795],
          zoom: 5,
          zoomControl: false,
          fadeAnimation: true,
        });

        // Create dedicated high-priority radar overlay pane above any base map
        const radarPane = map.createPane('radarPane');
        radarPane.style.zIndex = '450';
        radarPane.style.pointerEvents = 'none';

        const pinPane = map.createPane('pinPane');
        pinPane.style.zIndex = '650';

        L.control.zoom({ position: 'topright' }).addTo(map);

        map.on('zoomend', () => { if (typeof updateDisplacements === 'function') updateDisplacements(); });
        map.on('moveend', () => { if (typeof updateDisplacements === 'function') updateDisplacements(); });

        setBaseMap('carto-dark');
        loadRadarData();
      }

      function setBaseMap(type) {
        if (baseTileLayer && map.hasLayer(baseTileLayer)) {
          map.removeLayer(baseTileLayer);
        }
        const url = BASE_MAP_URLS[type] || BASE_MAP_URLS['carto-dark'];
        baseTileLayer = L.tileLayer(url, {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
          pane: 'tilePane'
        }).addTo(map);
      }

      // Fetch Radar Frames from RainViewer API
      async function loadRadarData() {
        try {
          const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
          if (!res.ok) throw new Error('API offline');
          radarData = await res.json();
          processFrames();
        } catch (err) {
          console.error('Failed to load radar data', err);
          alert('Could not load live radar frames. Retrying in 10 seconds.');
          setTimeout(loadRadarData, 10000);
        }
      }

      function processFrames() {
        if (!radarData || !radarData.radar) return;
        const past = radarData.radar.past || [];
        const nowcast = radarData.radar.nowcast || [];

        const nowTimestamp = past.length > 0 ? past[past.length - 1].time : Math.floor(Date.now() / 1000);
        allFrames = [];

        past.forEach((item, idx) => {
          const isLatest = idx === past.length - 1;
          allFrames.push({
            id: 'past_' + item.time,
            time: item.time,
            path: item.path,
            type: isLatest ? 'present' : 'past',
            relativeLabel: isLatest ? 'LIVE NOW' : formatDiff(item.time, nowTimestamp),
            formattedTime: new Date(item.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            forecastMinutes: 0
          });
        });

        if (nowcast && nowcast.length > 0) {
          nowcast.forEach((item, idx) => {
            allFrames.push({
              id: 'nowcast_' + item.time,
              time: item.time,
              path: item.path,
              type: 'future',
              relativeLabel: formatDiff(item.time, nowTimestamp),
              formattedTime: new Date(item.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              forecastMinutes: (idx + 1) * 10
            });
          });
        } else if (past && past.length > 0) {
          const lastPast = past[past.length - 1];
          const intervals = [15, 30, 45, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
          intervals.forEach((forecastMins) => {
            const fTime = lastPast.time + (forecastMins * 60);
            const hours = Math.floor(forecastMins / 60);
            const mins = forecastMins % 60;
            const labelStr = hours > 0
              ? (mins > 0 ? \`+\${hours}h \${mins}m (Model)\` : \`+\${hours}h 00m (Model)\`)
              : \`+\${mins}m (Model)\`;

            allFrames.push({
              id: 'future_nowcast_' + forecastMins + '_' + fTime,
              time: fTime,
              path: lastPast.path,
              type: 'future',
              relativeLabel: labelStr,
              formattedTime: new Date(fTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              forecastMinutes: forecastMins
            });
          });
        }

        applyFilterMode('past');
      }

      function formatDiff(time, now) {
        const diffMins = Math.round((time - now) / 60);
        if (Math.abs(diffMins) < 4) return 'LIVE NOW';
        if (diffMins < 0) return \`\${diffMins} min (Past)\`;
        return \`+\${diffMins} min (Future)\`;
      }

      function applyFilterMode(mode) {
        filterMode = mode;
        if (mode === 'past') {
          visibleFrames = allFrames.filter(f => f.type === 'past' || f.type === 'present');
        } else if (mode === 'future') {
          visibleFrames = allFrames.filter(f => f.type === 'present' || f.type === 'future');
        } else {
          visibleFrames = [...allFrames];
        }

        const slider = document.getElementById('timeline-slider');
        slider.min = '0';
        slider.max = (visibleFrames.length - 1).toString();

        if (mode === 'past') {
          const presentIdx = visibleFrames.findIndex(f => f.type === 'present');
          currentFrameIndex = presentIdx !== -1 ? presentIdx : visibleFrames.length - 1;
        } else {
          currentFrameIndex = 0;
        }
        slider.value = currentFrameIndex.toString();

        updateTimelineTrack();
        renderActiveFrame();
      }

      function updateTimelineTrack() {
        if (!visibleFrames || visibleFrames.length === 0) return;
        const total = Math.max(1, visibleFrames.length - 1);
        const percent = (currentFrameIndex / total) * 100;
        const fill = document.getElementById('track-fill');
        if (fill) {
          fill.style.width = percent + '%';
          if (filterMode === 'past') {
            fill.style.background = 'linear-gradient(to right, #2563eb, #38bdf8, #10b981)';
          } else {
            fill.style.background = 'linear-gradient(to right, #f59e0b, #ea580c, #e11d48)';
          }
        }

        const first = visibleFrames[0];
        const last = visibleFrames[visibleFrames.length - 1];
        if (first && last) {
          document.getElementById('label-start').textContent = \`\${first.formattedTime} (\${first.relativeLabel})\`;
          document.getElementById('label-mid').textContent = filterMode === 'past' ? 'Past 2h Radar History' : '6h Predictive Model Horizon';
          document.getElementById('label-end').textContent = \`\${last.formattedTime} (\${last.relativeLabel})\`;
        }
      }

      function getTileUrl(path) {
        const smoothVal = isSmooth ? 1 : 0;
        const snowVal = isSnow ? 1 : 0;
        return \`\${radarData.host}\${path}/256/{z}/{x}/{y}/\${colorScheme}/\${smoothVal}_\${snowVal}.png\`;
      }

      function clearRadarLayers() {
        Object.keys(radarLayersCache).forEach(key => {
          if (map && map.hasLayer(radarLayersCache[key])) {
            map.removeLayer(radarLayersCache[key]);
          }
        });
        radarLayersCache = {};
      }

      function getOrCreateRadarLayer(frame) {
        if (!frame || !radarData || !radarData.host) return null;
        const isFuture = frame.type === 'future';
        const headingDeg = 60; // Standard atmospheric steering vector ENE
        const speedKmH = 36;
        const cacheKey = isFuture
          ? frame.id + '_' + colorScheme + '_' + (isSmooth ? 1 : 0) + '_' + (isSnow ? 1 : 0) + '_' + headingDeg + '_' + speedKmH
          : frame.id + '_' + colorScheme + '_' + (isSmooth ? 1 : 0) + '_' + (isSnow ? 1 : 0);

        if (!radarLayersCache[cacheKey]) {
          const RadarLayerClass = L.GridLayer.extend({
            createTile: function(coords, done) {
              const tile = document.createElement('canvas');
              const size = 256;
              tile.width = size;
              tile.height = size;
              const ctx = tile.getContext('2d');
              if (!ctx) {
                done(null, tile);
                return tile;
              }

              ctx.clearRect(0, 0, size, size);
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              const z = coords.z;
              const nativeZ = Math.min(z, 7);
              const zoomDiff = z - nativeZ;
              const scale = Math.pow(2, zoomDiff);
              const nativeTotal = Math.pow(2, nativeZ);
              const cropSize = size / scale;

              const mins = isFuture ? (frame.forecastMinutes || 15) : 0;

              let srcX = coords.x;
              let srcY = coords.y;

              if (mins > 0) {
                const totalTiles = Math.pow(2, z);
                const hours = mins / 60;
                const distanceKm = speedKmH * hours;
                const headingRad = (headingDeg * Math.PI) / 180;
                const deltaEastKm = distanceKm * Math.sin(headingRad);
                const deltaNorthKm = distanceKm * Math.cos(headingRad);

                const tileCenterYNorm = (coords.y + 0.5) / totalTiles;
                const lat0Rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * tileCenterYNorm)));
                const lat0Deg = (lat0Rad * 180) / Math.PI;
                const cosLat0 = Math.max(0.12, Math.cos(lat0Rad));

                const deltaLatDeg = deltaNorthKm / 111.32;
                const deltaLngDeg = deltaEastKm / (111.32 * cosLat0);

                const lat1Deg = lat0Deg - deltaLatDeg;
                const lat1Rad = (Math.max(-85, Math.min(85, lat1Deg)) * Math.PI) / 180;

                const yNorm0 = 0.5 - (1 / (4 * Math.PI)) * Math.log((1 + Math.sin(lat0Rad)) / Math.max(1e-6, 1 - Math.sin(lat0Rad)));
                const yNorm1 = 0.5 - (1 / (4 * Math.PI)) * Math.log((1 + Math.sin(lat1Rad)) / Math.max(1e-6, 1 - Math.sin(lat1Rad)));
                const deltaTileY = (yNorm0 - yNorm1) * totalTiles;
                const deltaTileX = (deltaLngDeg / 360) * totalTiles;

                srcX = coords.x - deltaTileX;
                srcY = coords.y - deltaTileY;

                const uncertaintyAlpha = Math.max(0.40, 1.0 - (mins / 450) * 0.45);
                ctx.globalAlpha = uncertaintyAlpha;
              }

              const srcNativeX = srcX / scale;
              const srcNativeY = srcY / scale;

              const baseNativeX = Math.floor(srcNativeX);
              const baseNativeY = Math.floor(srcNativeY);

              const offsetNativePxX = (srcNativeX - baseNativeX) * size;
              const offsetNativePxY = (srcNativeY - baseNativeY) * size;

              const drawJobs = [];

              for (let dy = 0; dy <= 1; dy++) {
                for (let dx = 0; dx <= 1; dx++) {
                  const tx = baseNativeX + dx;
                  const ty = baseNativeY + dy;
                  const tileLeftNative = dx * size;
                  const tileTopNative = dy * size;

                  const intLeft = Math.max(tileLeftNative, offsetNativePxX);
                  const intRight = Math.min(tileLeftNative + size, offsetNativePxX + cropSize);
                  const intTop = Math.max(tileTopNative, offsetNativePxY);
                  const intBottom = Math.min(tileTopNative + size, offsetNativePxY + cropSize);

                  if (intRight > intLeft && intBottom > intTop) {
                    const sx = intLeft - tileLeftNative;
                    const sy = intTop - tileTopNative;
                    const sWidth = intRight - intLeft;
                    const sHeight = intBottom - intTop;

                    const cdx = (intLeft - offsetNativePxX) * scale;
                    const cdy = (intTop - offsetNativePxY) * scale;
                    const cdWidth = sWidth * scale;
                    const cdHeight = sHeight * scale;

                    const wrappedTx = ((tx % nativeTotal) + nativeTotal) % nativeTotal;
                    if (ty >= 0 && ty < nativeTotal) {
                      drawJobs.push({
                        tx: wrappedTx,
                        ty: ty,
                        sx: sx,
                        sy: sy,
                        sWidth: sWidth,
                        sHeight: sHeight,
                        dx: cdx,
                        dy: cdy,
                        dWidth: cdWidth,
                        dHeight: cdHeight,
                      });
                    }
                  }
                }
              }

              if (drawJobs.length === 0) {
                done(null, tile);
                return tile;
              }

              let loaded = 0;
              const checkDone = () => {
                loaded++;
                if (loaded >= drawJobs.length) {
                  done(null, tile);
                }
              };

              drawJobs.forEach(job => {
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(
                    img,
                    job.sx,
                    job.sy,
                    job.sWidth,
                    job.sHeight,
                    job.dx,
                    job.dy,
                    job.dWidth,
                    job.dHeight
                  );
                  checkDone();
                };
                img.onerror = () => checkDone();
                img.src = getTileUrl(frame.path)
                  .replace('{z}', nativeZ.toString())
                  .replace('{x}', job.tx.toString())
                  .replace('{y}', job.ty.toString());
              });

              return tile;
            }
          });

          const layer = new RadarLayerClass({
            tileSize: 256,
            pane: 'radarPane',
            zIndex: 450,
            opacity: 0,
            maxZoom: 18,
            keepBuffer: 12,
            updateWhenIdle: false,
            updateWhenZooming: true
          });

          layer.addTo(map);
          radarLayersCache[cacheKey] = layer;
        }
        return radarLayersCache[cacheKey];
      }

      function renderActiveFrame() {
        if (!visibleFrames || visibleFrames.length === 0) return;
        const frame = visibleFrames[currentFrameIndex];
        if (!frame) return;

        // UI Updates
        document.getElementById('timeline-slider').value = currentFrameIndex.toString();
        document.getElementById('frame-time').textContent = frame.formattedTime;
        
        const pill = document.getElementById('frame-pill');
        pill.className = 'pill pill-' + frame.type;
        pill.textContent = frame.type === 'present' ? 'LIVE NOW' : (frame.type === 'past' ? 'PAST SCAN' : 'FUTURE FORECAST');

        updateTimelineTrack();

        // Active layer
        const isFuture = frame.type === 'future';
        const activeKey = isFuture
          ? frame.id + '_' + colorScheme + '_' + (isSmooth ? 1 : 0) + '_' + (isSnow ? 1 : 0) + '_60_36'
          : frame.id + '_' + colorScheme + '_' + (isSmooth ? 1 : 0) + '_' + (isSnow ? 1 : 0);

        getOrCreateRadarLayer(frame);

        // Preload adjacent frames
        const next1 = (currentFrameIndex + 1) % visibleFrames.length;
        const next2 = (currentFrameIndex + 2) % visibleFrames.length;
        const prev1 = (currentFrameIndex - 1 + visibleFrames.length) % visibleFrames.length;
        getOrCreateRadarLayer(visibleFrames[next1]);
        getOrCreateRadarLayer(visibleFrames[next2]);
        getOrCreateRadarLayer(visibleFrames[prev1]);

        // Cross-fade opacity
        Object.keys(radarLayersCache).forEach(key => {
          const layer = radarLayersCache[key];
          if (key === activeKey) {
            layer.setOpacity(radarOpacity);
          } else {
            layer.setOpacity(0);
          }
        });
      }

      function step(forward = true) {
        if (visibleFrames.length === 0) return;
        if (forward) {
          currentFrameIndex = (currentFrameIndex + 1) % visibleFrames.length;
        } else {
          currentFrameIndex = (currentFrameIndex - 1 + visibleFrames.length) % visibleFrames.length;
        }
        renderActiveFrame();
      }

      function togglePlay() {
        isPlaying = !isPlaying;
        const playText = document.getElementById('play-text');
        const iconPlay = document.getElementById('icon-play');
        const iconPause = document.getElementById('icon-pause');

        if (isPlaying) {
          playText.textContent = 'Pause';
          iconPlay.style.display = 'none';
          iconPause.style.display = 'inline';
          playInterval = setInterval(() => step(true), playSpeedMs);
        } else {
          playText.textContent = 'Play';
          iconPlay.style.display = 'inline';
          iconPause.style.display = 'none';
          clearInterval(playInterval);
        }
      }

      function setSpeed(ms) {
        playSpeedMs = parseInt(ms, 10);
        if (isPlaying) {
          clearInterval(playInterval);
          playInterval = setInterval(() => step(true), playSpeedMs);
        }
      }

      // Event Listeners
      document.addEventListener('DOMContentLoaded', () => {
        initMap();

        document.getElementById('btn-play').addEventListener('click', togglePlay);
        document.getElementById('btn-prev').addEventListener('click', () => {
          if (isPlaying) togglePlay();
          step(false);
        });
        document.getElementById('btn-next').addEventListener('click', () => {
          if (isPlaying) togglePlay();
          step(true);
        });
        
        document.getElementById('timeline-slider').addEventListener('input', (e) => {
          if (isPlaying) togglePlay();
          currentFrameIndex = parseInt(e.target.value, 10);
          renderActiveFrame();
        });

        document.getElementById('select-speed').addEventListener('change', (e) => {
          setSpeed(e.target.value);
        });

        document.getElementById('select-basemap').addEventListener('change', (e) => {
          setBaseMap(e.target.value);
        });

        document.getElementById('select-colorscheme').addEventListener('change', (e) => {
          colorScheme = parseInt(e.target.value, 10);
          clearRadarLayers();
          renderActiveFrame();
        });

        document.getElementById('slider-opacity').addEventListener('input', (e) => {
          radarOpacity = parseInt(e.target.value, 10) / 100;
          document.getElementById('opacity-val').textContent = e.target.value + '%';
          renderActiveFrame();
        });

        document.getElementById('chk-smooth').addEventListener('change', (e) => {
          isSmooth = e.target.checked;
          clearRadarLayers();
          renderActiveFrame();
        });

        document.getElementById('chk-snow').addEventListener('change', (e) => {
          isSnow = e.target.checked;
          clearRadarLayers();
          renderActiveFrame();
        });

        // Mode buttons
        const btnPast = document.getElementById('mode-past');
        const btnFuture = document.getElementById('mode-future');
        const btnLive = document.getElementById('btn-live-jump');

        if (btnPast) {
          btnPast.addEventListener('click', () => {
            if (isPlaying) togglePlay();
            btnPast.style.background = '#2563eb';
            btnPast.style.color = '#fff';
            if (btnFuture) {
              btnFuture.style.background = 'transparent';
              btnFuture.style.color = '#94a3b8';
            }
            applyFilterMode('past');
          });
        }

        if (btnFuture) {
          btnFuture.addEventListener('click', () => {
            if (isPlaying) togglePlay();
            btnFuture.style.background = '#d97706';
            btnFuture.style.color = '#fff';
            if (btnPast) {
              btnPast.style.background = 'transparent';
              btnPast.style.color = '#94a3b8';
            }
            applyFilterMode('future');
          });
        }

        if (btnLive) {
          btnLive.addEventListener('click', () => {
            if (isPlaying) togglePlay();
            if (filterMode === 'past') {
              const presentIdx = visibleFrames.findIndex(f => f.type === 'present');
              currentFrameIndex = presentIdx !== -1 ? presentIdx : visibleFrames.length - 1;
            } else {
              currentFrameIndex = 0;
            }
            renderActiveFrame();
          });
        }

        // Live Search with Autocomplete Dropdown (CONUS Bounded)
        const searchInput = document.getElementById('city-search');
        const searchDropdown = document.getElementById('search-dropdown');
        const searchClearBtn = document.getElementById('btn-search-clear');
        let searchDebounceTimer = null;
        let activeSearchResults = [];

        function setLocationPin(lat, lon, label) {
          map.setView([lat, lon], 9);
          if (searchPinMarker) {
            map.removeLayer(searchPinMarker);
          }

          const pinIcon = L.divIcon({
            className: 'custom-small-pin',
            html: '<div style="display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));"><svg width="18" height="24" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.627-5.373-12-12-12z" fill="#e11d48" stroke="#ffffff" stroke-width="1.8"/><circle cx="12" cy="11" r="4.2" fill="#ffffff"/></svg></div>',
            iconSize: [18, 24],
            iconAnchor: [9, 24]
          });

          searchPinMarker = L.marker([lat, lon], {
            icon: pinIcon,
            pane: 'pinPane',
            zIndexOffset: 1000,
            title: label || ''
          }).addTo(map);
        }

        async function performSearch(query) {
          const trimmed = query ? query.trim() : '';
          if (!trimmed || trimmed.length < 2) {
            searchDropdown.style.display = 'none';
            searchDropdown.innerHTML = '';
            activeSearchResults = [];
            return;
          }

          searchDropdown.innerHTML = '<div style="padding: 10px; font-size: 12px; color: #94a3b8; text-align: center;">Searching CONUS radar area...</div>';
          searchDropdown.style.display = 'block';

          try {
            const isZip = /^\\d{5}(-\\d{4})?$/.test(trimmed);
            const searchUrl = isZip
              ? 'https://nominatim.openstreetmap.org/search?format=json&postalcode=' + encodeURIComponent(trimmed) + '&countrycodes=us&addressdetails=1&limit=8'
              : 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(trimmed) + '&countrycodes=us&addressdetails=1&limit=8';

            let res = await fetch(searchUrl, { headers: { 'Accept-Language': 'en' } });
            let data = res.ok ? await res.json() : [];

            if (isZip && (!data || data.length === 0)) {
              const fallbackUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(trimmed + ' USA') + '&countrycodes=us&addressdetails=1&limit=8';
              res = await fetch(fallbackUrl, { headers: { 'Accept-Language': 'en' } });
              if (res.ok) data = await res.json();
            }

            // CONUS radar coverage bounds: Lat 24-50°N, Lon -125 to -66.5°W
            const conusItems = (data || []).filter(item => {
              const lat = parseFloat(item.lat);
              const lon = parseFloat(item.lon);
              return !isNaN(lat) && !isNaN(lon) && lat >= 24.0 && lat <= 50.0 && lon >= -125.0 && lon <= -66.5;
            });

            activeSearchResults = conusItems.map(item => {
              const addr = item.address || {};
              const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
              const state = addr.state || addr.state_code || '';
              const postcode = addr.postcode || (isZip ? trimmed : '');

              let mainName = item.name || item.display_name.split(',')[0];
              if (city && state && postcode) {
                mainName = city + ', ' + state + ' ' + postcode;
              } else if (city && state) {
                mainName = city + ', ' + state;
              } else if (city) {
                mainName = city;
              }

              return {
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                mainName: mainName.trim(),
                displayName: item.display_name
              };
            });

            if (activeSearchResults.length === 0) {
              searchDropdown.innerHTML = '<div style="padding: 10px; font-size: 12px; color: #94a3b8; text-align: center;">No locations found within CONUS radar coverage.</div>';
              return;
            }

            searchDropdown.innerHTML = '';
            activeSearchResults.forEach((loc) => {
              const itemEl = document.createElement('div');
              itemEl.className = 'search-item';
              itemEl.innerHTML = '<div class="search-item-main"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span>' + loc.mainName + '</span></div><div class="search-item-sub">' + loc.displayName + '</div>';
              itemEl.addEventListener('click', () => {
                selectLocation(loc);
              });
              searchDropdown.appendChild(itemEl);
            });
          } catch (err) {
            console.error('Search error:', err);
            searchDropdown.innerHTML = '<div style="padding: 10px; font-size: 12px; color: #ef4444; text-align: center;">Search request error.</div>';
          }
        }

        function selectLocation(loc) {
          searchInput.value = loc.mainName;
          if (searchClearBtn) searchClearBtn.style.display = 'inline-flex';
          searchDropdown.style.display = 'none';
          setLocationPin(loc.lat, loc.lon, loc.mainName);
        }

        searchInput.addEventListener('input', (e) => {
          const val = e.target.value;
          if (searchClearBtn) searchClearBtn.style.display = val.length > 0 ? 'inline-flex' : 'none';
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = setTimeout(() => {
            performSearch(val);
          }, 300);
        });

        searchInput.addEventListener('focus', () => {
          if (activeSearchResults.length > 0) {
            searchDropdown.style.display = 'block';
          }
        });

        if (searchClearBtn) {
          searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchClearBtn.style.display = 'none';
            searchDropdown.style.display = 'none';
            searchDropdown.innerHTML = '';
            activeSearchResults = [];
            if (searchPinMarker) {
              map.removeLayer(searchPinMarker);
              searchPinMarker = null;
            }
            searchInput.focus();
          });
        }

        document.addEventListener('click', (e) => {
          if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.style.display = 'none';
          }
        });

        searchInput.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (activeSearchResults.length > 0) {
              selectLocation(activeSearchResults[0]);
            } else if (searchInput.value.trim().length >= 2) {
              await performSearch(searchInput.value.trim());
              if (activeSearchResults.length > 0) {
                selectLocation(activeSearchResults[0]);
              }
            }
          } else if (e.key === 'Escape') {
            searchDropdown.style.display = 'none';
          }
        });

        // GPS button
        document.getElementById('btn-gps').addEventListener('click', () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              setLocationPin(pos.coords.latitude, pos.coords.longitude, 'My Location');
            });
          }
        });
      });
    })();
  </script>
</body>
</html>`;
}
