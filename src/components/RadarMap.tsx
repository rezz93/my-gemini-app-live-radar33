import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Wind, Navigation, Sparkles, TrendingUp } from 'lucide-react';
import { RadarFrame, BaseMapStyle } from '../types';
import { BASE_MAPS, buildRadarTileUrl } from '../services/radarService';

interface RadarMapProps {
  activeFrame: RadarFrame | null;
  frames?: RadarFrame[];
  radarHost: string;
  selectedBaseMapId: string;
  colorScheme: number;
  isSmooth: boolean;
  isSnow: boolean;
  radarOpacity: number;
  tileSize: 256 | 512;
  center: [number, number];
  zoom: number;
  onMapClick: (lat: number, lon: number) => void;
  selectedLocation: { lat: number; lon: number; name?: string } | null;
  windSpeed?: number;
  windDirection?: number;
}

function getHeadingCardinal(deg: number): string {
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return cardinals[index];
}

// Custom Leaflet GridLayer for dynamic storm advection, native upsampling & NWP future extrapolation
function createRadarTileLayer(options: {
  host: string;
  basePath: string;
  colorScheme: number;
  isSmooth: boolean;
  isSnow: boolean;
  tileSize: 256 | 512;
  forecastMinutes?: number;
  stormHeadingDeg?: number;
  effectiveSpeedKmH?: number;
  pane?: string;
  zIndex?: number;
}) {
  const RadarLayerClass = (L.GridLayer as any).extend({
    createTile: function (coords: { x: number; y: number; z: number }, done: (error: any, tile: HTMLCanvasElement) => void) {
      const tile = document.createElement('canvas');
      const size = options.tileSize || 256;
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

      const mins = options.forecastMinutes || 0;

      let srcX = coords.x;
      let srcY = coords.y;

      if (mins > 0) {
        const totalTiles = Math.pow(2, z);
        const hours = mins / 60;
        const distanceKm = (options.effectiveSpeedKmH || 36) * hours;
        const headingRad = ((options.stormHeadingDeg || 60) * Math.PI) / 180;
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

      const drawJobs: Array<{
        tx: number;
        ty: number;
        sx: number;
        sy: number;
        sWidth: number;
        sHeight: number;
        dx: number;
        dy: number;
        dWidth: number;
        dHeight: number;
      }> = [];

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
                sx,
                sy,
                sWidth,
                sHeight,
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

      drawJobs.forEach((job) => {
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
        img.src = buildRadarTileUrl(
          options.host,
          options.basePath,
          options.colorScheme,
          options.isSmooth,
          options.isSnow,
          size
        )
          .replace('{z}', nativeZ.toString())
          .replace('{x}', job.tx.toString())
          .replace('{y}', job.ty.toString());
      });

      return tile;
    },
  });

  return new RadarLayerClass({
    tileSize: options.tileSize || 256,
    pane: options.pane || 'radarPane',
    zIndex: options.zIndex || 450,
    opacity: 0,
    maxZoom: 18,
    keepBuffer: 12,
    updateWhenIdle: false,
    updateWhenZooming: true,
  });
}

export const RadarMap: React.FC<RadarMapProps> = ({
  activeFrame,
  frames = [],
  radarHost,
  selectedBaseMapId,
  colorScheme,
  isSmooth,
  isSnow,
  radarOpacity,
  tileSize,
  center,
  zoom,
  onMapClick,
  selectedLocation,
  windSpeed = 24,
  windDirection = 250,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseMapLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayersCacheRef = useRef<Map<string, L.GridLayer | L.TileLayer>>(new Map());
  const markerRef = useRef<L.Marker | L.CircleMarker | null>(null);

  // Storm steering flow motion
  const stormHeadingDeg = Math.round((windDirection + 180) % 360);
  const stormHeadingCardinal = getHeadingCardinal(stormHeadingDeg);
  const effectiveSpeedKmH = Math.round(Math.max(20, windSpeed || 24));
  const effectiveSpeedMph = Math.round(effectiveSpeedKmH * 0.621371);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: true,
      minZoom: 3,
      maxZoom: 18,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    // Dedicated high-priority pane for radar layers (above base map)
    const radarPane = map.createPane('radarPane');
    radarPane.style.zIndex = '450';
    radarPane.style.pointerEvents = 'none';

    // Dedicated pin pane above radar overlay
    const pinPane = map.createPane('pinPane');
    pinPane.style.zIndex = '650';

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center & zoom when changed from external action
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentCenter = mapInstanceRef.current.getCenter();
    const dist = Math.hypot(currentCenter.lat - center[0], currentCenter.lng - center[1]);
    if (dist > 0.001) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom]);

  // Update Base Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const baseConfig = BASE_MAPS.find((b) => b.id === selectedBaseMapId) || BASE_MAPS[0];

    if (baseMapLayerRef.current) {
      mapInstanceRef.current.removeLayer(baseMapLayerRef.current);
    }

    const newBaseLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom,
      subdomains: ['a', 'b', 'c', 'd'],
      pane: 'tilePane',
    });

    newBaseLayer.addTo(mapInstanceRef.current);
    baseMapLayerRef.current = newBaseLayer;
  }, [selectedBaseMapId]);

  // Preload and manage all loop frames in the map
  useEffect(() => {
    if (!mapInstanceRef.current || !radarHost || frames.length === 0) return;
    const map = mapInstanceRef.current;

    const currentKeys = new Set<string>();

    frames.forEach((frame) => {
      const isFuture = frame.type === 'future';
      const cacheKey = isFuture
        ? `${frame.id}_${colorScheme}_${isSmooth ? 1 : 0}_${isSnow ? 1 : 0}_${tileSize}_${stormHeadingDeg}_${effectiveSpeedKmH}`
        : `${frame.id}_${colorScheme}_${isSmooth ? 1 : 0}_${isSnow ? 1 : 0}_${tileSize}`;

      currentKeys.add(cacheKey);

      if (!radarLayersCacheRef.current.has(cacheKey)) {
        let layer: L.GridLayer | L.TileLayer;

        layer = createRadarTileLayer({
          host: radarHost,
          basePath: frame.path,
          colorScheme,
          isSmooth,
          isSnow,
          tileSize,
          forecastMinutes: isFuture ? (frame.forecastMinutes || 15) : 0,
          stormHeadingDeg,
          effectiveSpeedKmH,
          pane: 'radarPane',
          zIndex: 450,
        });

        layer.addTo(map);
        radarLayersCacheRef.current.set(cacheKey, layer);
      }
    });

    // Cleanup cached layers no longer in current frame set
    radarLayersCacheRef.current.forEach((cachedLayer, key) => {
      if (!currentKeys.has(key)) {
        if (map.hasLayer(cachedLayer)) {
          map.removeLayer(cachedLayer);
        }
        radarLayersCacheRef.current.delete(key);
      }
    });
  }, [frames, radarHost, colorScheme, isSmooth, isSnow, tileSize, stormHeadingDeg, effectiveSpeedKmH]);

  // Smoothly cross-fade active radar frame
  useEffect(() => {
    if (!mapInstanceRef.current || !activeFrame || !radarHost) return;

    const isFuture = activeFrame.type === 'future';
    const activeKey = isFuture
      ? `${activeFrame.id}_${colorScheme}_${isSmooth ? 1 : 0}_${isSnow ? 1 : 0}_${tileSize}_${stormHeadingDeg}_${effectiveSpeedKmH}`
      : `${activeFrame.id}_${colorScheme}_${isSmooth ? 1 : 0}_${isSnow ? 1 : 0}_${tileSize}`;

    radarLayersCacheRef.current.forEach((layer, key) => {
      if (key === activeKey) {
        layer.setOpacity(radarOpacity);
      } else {
        layer.setOpacity(0);
      }
    });
  }, [activeFrame, radarOpacity, radarHost, colorScheme, isSmooth, isSnow, tileSize, stormHeadingDeg, effectiveSpeedKmH]);

  // Selected Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (selectedLocation) {
      const customIcon = L.divIcon({
        className: 'custom-small-pin',
        html: `
          <div style="display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
            <svg width="18" height="24" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.627-5.373-12-12-12z" fill="#e11d48" stroke="#ffffff" stroke-width="1.8"/>
              <circle cx="12" cy="11" r="4.2" fill="#ffffff"/>
            </svg>
          </div>
        `,
        iconSize: [18, 24],
        iconAnchor: [9, 24],
      });

      const marker = L.marker([selectedLocation.lat, selectedLocation.lon], {
        icon: customIcon,
        pane: 'pinPane',
        zIndexOffset: 1000,
        title: selectedLocation.name || '',
      }).addTo(map);

      markerRef.current = marker;
    }
  }, [selectedLocation]);

  const isFutureActive = activeFrame?.type === 'future';

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <div id="radar-map-container" ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Storm Track & Forecast Model HUD (Active in Future mode) */}
      {isFutureActive && (
        <div className="absolute top-20 right-4 z-[900] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 shadow-2xl rounded-2xl p-3 text-slate-100 max-w-xs ring-1 ring-amber-500/20">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>6h Predictive Forecast</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                +{activeFrame.forecastMinutes ? `${activeFrame.forecastMinutes >= 60 ? `${(activeFrame.forecastMinutes/60).toFixed(1)}h` : `${activeFrame.forecastMinutes}m`}` : '0m'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-1 text-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Navigation
                  className="w-4 h-4 text-amber-400 transition-transform duration-500"
                  style={{ transform: `rotate(${stormHeadingDeg}deg)` }}
                />
              </div>
              <div>
                <div className="font-semibold text-white text-[12px] flex items-center gap-1">
                  <span>Steering Vector: {stormHeadingCardinal}</span>
                  <span className="text-slate-400 font-normal">({stormHeadingDeg}°)</span>
                  <span className="text-amber-400 font-bold">@ {effectiveSpeedMph} mph</span>
                </div>
                <div className="text-[10.5px] text-slate-400">
                  Atmospheric steering & HRRR/NWP model advection horizon up to +6 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
