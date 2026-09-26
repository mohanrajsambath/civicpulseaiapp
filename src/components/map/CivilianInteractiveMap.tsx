import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  Layers, 
  CloudRain, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  ExternalLink,
  Satellite,
  Compass,
  Sparkles,
  Info,
  X,
  Map as MapIcon,
  Mountain,
  Bus,
  Car,
  Activity,
  Train
} from 'lucide-react';
import { Grievance, WeatherAlert } from '../../types';
import { SECTOR_CONFIG } from '../../data/seedData';

export type MapLayerType = 'default' | 'satellite' | 'terrain' | 'transit' | 'traffic' | 'hydrology';

interface CivilianInteractiveMapProps {
  grievances: Grievance[];
  weatherAlerts: WeatherAlert[];
  onSelectGrievance: (grievance: Grievance) => void;
  onUpvoteGrievance: (id: string, e?: React.MouseEvent) => void;
  onDropPinAtCoordinates?: (coords: { lat: number; lng: number; districtName: string; ward: string }) => void;
}

// Preset regions for rapid centering
const REGION_CENTERS: Record<string, { lat: number; lng: number; zoom: number; name: string }> = {
  All: { lat: 21.0, lng: 82.0, zoom: 1.0, name: 'Pan-India Overview' },
  Madurai: { lat: 9.9252, lng: 78.1198, zoom: 2.4, name: 'Madurai, Tamil Nadu' },
  Varanasi: { lat: 25.3176, lng: 82.9739, zoom: 2.4, name: 'Varanasi, UP' },
  Gaya: { lat: 24.7914, lng: 85.0002, zoom: 2.4, name: 'Gaya, Bihar' },
  Kamrup: { lat: 26.3167, lng: 91.5833, zoom: 2.4, name: 'Kamrup, Assam' },
  Bengaluru: { lat: 13.2385, lng: 77.5750, zoom: 2.4, name: 'Bengaluru Rural, KA' },
  Pune: { lat: 18.5204, lng: 73.8567, zoom: 2.4, name: 'Pune, Maharashtra' }
};

export const CivilianInteractiveMap: React.FC<CivilianInteractiveMapProps> = ({
  grievances,
  weatherAlerts,
  onSelectGrievance,
  onUpvoteGrievance,
  onDropPinAtCoordinates
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [mapLayer, setMapLayer] = useState<MapLayerType>('satellite');
  const [showWeatherRadar, setShowWeatherRadar] = useState<boolean>(true);
  const [isDropPinMode, setIsDropPinMode] = useState<boolean>(false);
  const [activePinDetail, setActivePinDetail] = useState<Grievance | null>(null);
  const [droppedPin, setDroppedPin] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({ lat: 9.9252, lng: 78.1198 });

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Geographic boundaries for normalized India bounding box
  const BBOX = {
    minLat: 8.0,
    maxLat: 33.5,
    minLng: 68.0,
    maxLng: 97.5
  };

  // Convert lat/lng into percentage inside container (0-100%)
  const coordsToPercent = (lat: number, lng: number) => {
    const xPct = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100;
    const yPct = (1 - (lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, xPct)),
      y: Math.max(5, Math.min(95, yPct))
    };
  };

  // Handle click on map when "Drop Pin Mode" is active
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPct = (clickX / rect.width) * 100;
    const yPct = (clickY / rect.height) * 100;

    const lng = BBOX.minLng + (xPct / 100) * (BBOX.maxLng - BBOX.minLng);
    const lat = BBOX.minLat + (1 - yPct / 100) * (BBOX.maxLat - BBOX.minLat);

    setDroppedPin({
      x: xPct,
      y: yPct,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4))
    });

    if (onDropPinAtCoordinates && isDropPinMode) {
      onDropPinAtCoordinates({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        districtName: selectedRegion === 'All' ? 'Madurai' : selectedRegion,
        ward: `Ward ${(Math.floor(lat * 10) % 40) + 1} (Survey Grid)`
      });
    }
  };

  // Simulated GPS auto-detect
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSelectedRegion('Madurai');
        },
        () => {
          setUserLocation({ lat: 9.9252, lng: 78.1198 });
          setSelectedRegion('Madurai');
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Map Control Bar */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-lg space-y-2.5">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* District & Region Select */}
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400 shrink-0" />
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setActivePinDetail(null);
              }}
              className="bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-teal-500 cursor-pointer"
            >
              {Object.entries(REGION_CENTERS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Weather radar toggle */}
            <button
              onClick={() => setShowWeatherRadar(!showWeatherRadar)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                showWeatherRadar
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">IMD Weather Radar</span>
              <span className="xs:hidden">Radar</span>
            </button>

            {/* Drop Pin Mode Trigger */}
            <button
              onClick={() => {
                setIsDropPinMode(!isDropPinMode);
                if (!isDropPinMode) setActivePinDetail(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDropPinMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 font-bold'
                  : 'bg-slate-950 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isDropPinMode ? 'Click Map to Spot' : 'Report Spot'}</span>
            </button>
          </div>
        </div>

        {/* Map Type Switcher Row (Default, Satellite, Terrain, Public Transport, Traffic, Hydrology) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] overflow-x-auto w-full sm:w-auto">
            {/* 1. Default (Streets) */}
            <button
              onClick={() => setMapLayer('default')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                mapLayer === 'default'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Default Street Network & Civic Arteries"
            >
              <MapIcon className="w-3.5 h-3.5 text-slate-300" />
              <span>Default (Streets)</span>
            </button>

            {/* 2. GEE Satellite */}
            <button
              onClick={() => setMapLayer('satellite')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                mapLayer === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Google Earth Engine Sentinel-2 Multispectral Feeds"
            >
              <Satellite className="w-3.5 h-3.5 text-blue-300" />
              <span>GEE Satellite</span>
            </button>

            {/* 3. Terrain */}
            <button
              onClick={() => setMapLayer('terrain')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                mapLayer === 'terrain'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Topography, Elevation Contours & Drainage Slopes"
            >
              <Mountain className="w-3.5 h-3.5 text-emerald-300" />
              <span>Terrain</span>
            </button>

            {/* 4. Public Transport */}
            <button
              onClick={() => setMapLayer('transit')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                mapLayer === 'transit'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bus Rapid Corridors, Metro Rail & Indian Railways"
            >
              <Bus className="w-3.5 h-3.5 text-indigo-300" />
              <span>Public Transport</span>
            </button>

            {/* 5. Traffic */}
            <button
              onClick={() => setMapLayer('traffic')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                mapLayer === 'traffic'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Real-time Traffic Congestion & Flood Road Detours"
            >
              <Car className="w-3.5 h-3.5 text-amber-300" />
              <span>Traffic</span>
            </button>

            {/* 6. Hydrology & Drain */}
            <button
              onClick={() => setMapLayer('hydrology')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                mapLayer === 'hydrology'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="River Basins, Urban Culverts & Inundation Depressions"
            >
              <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
              <span>Hydrology/Drain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#081528] select-none">
        {/* Layer Canvas Simulator */}
        <div
          ref={mapContainerRef}
          onClick={handleMapClick}
          className={`relative w-full h-full cursor-crosshair overflow-hidden transition-all duration-500 ${
            mapLayer === 'satellite'
              ? 'bg-gradient-to-br from-[#071321] via-[#0b1e33] to-[#040e1b]'
              : mapLayer === 'terrain'
              ? 'bg-gradient-to-br from-[#06231a] via-[#0c3628] to-[#154832]'
              : mapLayer === 'transit'
              ? 'bg-gradient-to-br from-[#081426] via-[#0f1f38] to-[#0a162b]'
              : mapLayer === 'traffic'
              ? 'bg-gradient-to-br from-[#09111e] via-[#111d2e] to-[#0d1624]'
              : mapLayer === 'hydrology'
              ? 'bg-gradient-to-br from-[#061826] via-[#082338] to-[#03111b]'
              : 'bg-gradient-to-br from-[#0b1728] via-[#16283d] to-[#0c192b]'
          }`}
        >
          {/* Subtle Geospatial Coordinate Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* National Landmass Silhouette */}
          <svg
            viewBox="0 0 800 600"
            className="absolute inset-0 w-full h-full opacity-45 pointer-events-none transition-transform duration-700 ease-out"
            preserveAspectRatio="none"
          >
            <path
              d="M 280 90 Q 320 80 370 110 T 450 140 Q 520 160 580 140 T 630 200 Q 640 260 590 280 T 520 310 Q 480 340 460 390 T 430 460 Q 410 520 390 560 Q 380 570 370 560 Q 340 480 330 420 T 300 350 Q 250 310 240 260 T 260 170 Z"
              fill={
                mapLayer === 'satellite' ? '#0f2942' :
                mapLayer === 'terrain' ? '#143c2c' :
                mapLayer === 'transit' ? '#132842' :
                mapLayer === 'traffic' ? '#142333' :
                mapLayer === 'hydrology' ? '#09253b' : '#172c44'
              }
              stroke="#0ea5e9"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

            {/* --- LAYER 1: DEFAULT / STREETS --- */}
            {mapLayer === 'default' && (
              <g fill="none">
                {/* Golden Quadrilateral / National Highways */}
                <path d="M 310 170 L 450 210 L 470 380 L 370 470 L 300 310 Z" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8" />
                <path d="M 310 170 L 450 210 L 470 380 L 370 470 L 300 310 Z" stroke="#fbbf24" strokeWidth="1" strokeDasharray="6 4" opacity="0.9" />

                {/* State Arterials & Urban Bypass Rings */}
                <circle cx="370" cy="470" r="30" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
                <path d="M 340 450 L 400 490" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
                <circle cx="450" cy="210" r="25" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
                <circle cx="560" cy="250" r="28" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
                <path d="M 280 200 L 370 340 L 430 460" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              </g>
            )}

            {/* --- LAYER 2: GEE SATELLITE (Multi-spectral Canopy) --- */}
            {mapLayer === 'satellite' && (
              <g fill="none">
                {/* Forest cover / Western Ghats & Eastern Hills */}
                <path d="M 300 320 Q 320 400 340 500" stroke="#10b981" strokeWidth="12" opacity="0.25" strokeLinecap="round" />
                {/* Ganga Plain Agriculture Belt */}
                <path d="M 310 170 Q 400 200 500 220" stroke="#059669" strokeWidth="14" opacity="0.2" strokeLinecap="round" />
                {/* Sensor Scan Grid */}
                <line x1="200" y1="150" x2="650" y2="150" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="8 6" opacity="0.4" />
                <line x1="200" y1="300" x2="650" y2="300" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="8 6" opacity="0.4" />
                <line x1="200" y1="450" x2="650" y2="450" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="8 6" opacity="0.4" />
              </g>
            )}

            {/* --- LAYER 3: TERRAIN (Elevation Contours & Hillshades) --- */}
            {mapLayer === 'terrain' && (
              <g fill="none" opacity="0.8">
                {/* Elevation Contours (100m, 250m, 500m, 800m) */}
                <path d="M 270 120 Q 340 100 420 130 T 540 150" stroke="#34d399" strokeWidth="1" />
                <path d="M 260 140 Q 330 120 410 150 T 530 170" stroke="#10b981" strokeWidth="1.2" />
                <path d="M 280 280 Q 340 250 400 290 T 500 320" stroke="#059669" strokeWidth="1.5" />
                <path d="M 290 320 Q 330 380 350 480" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M 305 340 Q 340 400 360 470" stroke="#d97706" strokeWidth="1.2" />

                {/* Hillshade relief shading */}
                <polygon points="280,260 320,300 300,340 270,300" fill="#047857" opacity="0.3" />
                <polygon points="330,420 370,450 350,510 320,480" fill="#b45309" opacity="0.25" />
              </g>
            )}

            {/* --- LAYER 4: PUBLIC TRANSPORT (Rail Trunks & Metro Corridors) --- */}
            {mapLayer === 'transit' && (
              <g fill="none">
                {/* Indian Railways Trunk Line (Black & White railroad dash) */}
                <path d="M 310 170 L 450 210 L 470 380 L 370 470 L 300 310 Z" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 4" opacity="0.9" />

                {/* Metro Purple Line (North-South Rapid) */}
                <path d="M 360 430 L 370 470 L 380 520" stroke="#a855f7" strokeWidth="3.5" opacity="0.9" strokeLinecap="round" />
                {/* Metro Cyan Line (East-West Rapid) */}
                <path d="M 330 470 L 370 470 L 410 470" stroke="#06b6d4" strokeWidth="3" opacity="0.9" strokeLinecap="round" />
                {/* BRT Green Rapid Bus Corridor */}
                <path d="M 430 190 L 450 210 L 490 230" stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" opacity="0.9" />

                {/* Intermodal Station Hubs */}
                <circle cx="370" cy="470" r="5" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
                <circle cx="450" cy="210" r="5" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
                <circle cx="310" cy="170" r="5" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
              </g>
            )}

            {/* --- LAYER 5: TRAFFIC (Live Flow Vectors & Congestion) --- */}
            {mapLayer === 'traffic' && (
              <g fill="none" strokeLinecap="round">
                {/* Free Flow Corridors (Green - 50 km/h) */}
                <path d="M 310 170 L 380 190" stroke="#22c55e" strokeWidth="3" opacity="0.85" />
                <path d="M 470 380 L 420 425" stroke="#22c55e" strokeWidth="3" opacity="0.85" />
                <path d="M 300 310 L 335 390" stroke="#22c55e" strokeWidth="3" opacity="0.85" />

                {/* Moderate Congestion Corridors (Amber - 25 km/h) */}
                <path d="M 380 190 L 450 210" stroke="#eab308" strokeWidth="3" opacity="0.85" />
                <path d="M 335 390 L 360 450" stroke="#eab308" strokeWidth="3" opacity="0.85" />

                {/* Severe Congestion / Bottleneck (Red - 7 km/h - Near reported waterlogging spots) */}
                <path d="M 360 450 L 375 480" stroke="#ef4444" strokeWidth="4" opacity="0.95" />
                <path d="M 450 210 L 470 260" stroke="#ef4444" strokeWidth="4" opacity="0.95" />

                {/* Traffic Bottleneck Warning Rings */}
                <circle cx="370" cy="470" r="8" stroke="#ef4444" strokeWidth="2" fill="none" className="animate-ping" />
              </g>
            )}

            {/* --- LAYER 6: HYDROLOGY & DRAINAGE (River Basins & Storm Culverts) --- */}
            {(mapLayer === 'hydrology' || mapLayer === 'satellite') && (
              <g stroke="#06b6d4" strokeWidth="1.6" opacity="0.75" fill="none">
                {/* Ganga Basin */}
                <path d="M 310 170 Q 370 190 440 210 T 560 250" />
                {/* Brahmaputra */}
                <path d="M 520 150 Q 600 155 640 180" />
                {/* Godavari & Krishna */}
                <path d="M 300 310 Q 370 340 440 370" />
                {/* Cauvery & Vaigai Drainage Basin */}
                <path d="M 330 460 Q 380 475 420 480" />
                {/* Subterranean Storm Runoff Conduits */}
                <path d="M 355 450 L 385 490" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 2" />
              </g>
            )}
          </svg>

          {/* Live GEE / IMD Precipitation Radar Heat-Ring Overlay */}
          {showWeatherRadar && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Madurai rainfall threat zone */}
              <div 
                className="absolute w-44 h-44 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 blur-md animate-pulse"
                style={{
                  left: '42%',
                  top: '74%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
              <div 
                className="absolute w-24 h-24 rounded-full bg-rose-500/25 border-2 border-rose-400/60 blur-xs animate-ping"
                style={{
                  left: '42%',
                  top: '74%',
                  transform: 'translate(-50%, -50%)',
                  animationDuration: '3s'
                }}
              />

              {/* Assam Kamrup flood threat zone */}
              <div 
                className="absolute w-52 h-52 rounded-full bg-blue-500/20 border-2 border-blue-400/50 blur-md animate-pulse"
                style={{
                  left: '72%',
                  top: '32%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
          )}

          {/* Interactive Grievance Map Pins */}
          {grievances.map((item) => {
            const { x, y } = coordsToPercent(item.coordinates.lat, item.coordinates.lng);
            const isCritical = item.urgencyScore >= 8 || item.weatherRisk?.hasActiveRisk;
            const isResolved = item.status === 'resolved';
            const isSelected = activePinDetail?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePinDetail(item);
                  setIsDropPinMode(false);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20 group ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* Pulsing beacon ring for severe weather risks */}
                {item.weatherRisk?.hasActiveRisk && (
                  <div className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                )}

                {/* Marker Body */}
                <div
                  className={`relative flex items-center justify-center rounded-full shadow-xl p-1.5 border-2 transition-all ${
                    isResolved
                      ? 'bg-emerald-600 border-white text-white'
                      : isCritical
                      ? 'bg-rose-600 border-rose-200 text-white shadow-rose-950/60'
                      : 'bg-amber-500 border-slate-900 text-slate-950 shadow-amber-950/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>

                {/* Micro Label Pill */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:flex items-center gap-1 bg-slate-950/95 border border-slate-700 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl z-30 pointer-events-none">
                  <span className="font-bold">{item.id}:</span>
                  <span className="truncate max-w-[120px]">{item.title}</span>
                </div>
              </div>
            );
          })}

          {/* Dropped Pin Indicator */}
          {droppedPin && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
              style={{ left: `${droppedPin.x}%`, top: `${droppedPin.y}%` }}
            >
              <div className="relative flex flex-col items-center">
                <span className="animate-ping absolute h-8 w-8 rounded-full bg-amber-400 opacity-75" />
                <div className="bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-2xl border-2 border-white">
                  <MapPin className="w-4 h-4 fill-slate-950" />
                </div>
                <div className="bg-slate-950/90 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 mt-1 whitespace-nowrap">
                  GPS: {droppedPin.lat.toFixed(4)}, {droppedPin.lng.toFixed(4)}
                </div>
              </div>
            </div>
          )}

          {/* Active Map Layer HUD / Context Banner */}
          <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] flex items-center gap-2 shadow-lg z-10 text-slate-200">
            {mapLayer === 'default' && (
              <>
                <MapIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>Default Streets</strong>: National Highways (NH-44), State Arterials &amp; Urban Ward Grids
                </span>
              </>
            )}
            {mapLayer === 'satellite' && (
              <>
                <Satellite className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  <strong>GEE Satellite Feed</strong>: Sentinel-2 Multispectral • 10m Resolution
                </span>
              </>
            )}
            {mapLayer === 'terrain' && (
              <>
                <Mountain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Topographic Terrain</strong>: Elevation Contours (10m Intervals) &amp; Runoff Slopes
                </span>
              </>
            )}
            {mapLayer === 'transit' && (
              <>
                <Bus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  <strong>Public Transport</strong>: Indian Railway Mainlines, Metro Corridors &amp; BRT Network
                </span>
              </>
            )}
            {mapLayer === 'traffic' && (
              <>
                <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>Live Traffic Flow</strong>: Real-time Congestion Vectors &amp; Flood Inundation Detours
                </span>
              </>
            )}
            {mapLayer === 'hydrology' && (
              <>
                <CloudRain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  <strong>Hydrology &amp; Drainage</strong>: River Basins, Urban Culverts &amp; Storm Catchments
                </span>
              </>
            )}
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-xs px-3 py-2 rounded-2xl border border-slate-800 text-[11px] space-y-1 shadow-lg z-10 hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-400">Map Legend:</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white" />
              <span>Critical Hazard (Urgency &gt; 8)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
              <span>In Progress / Allocated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white" />
              <span>Resolved with Photo Proof</span>
            </div>
            {mapLayer === 'traffic' && (
              <div className="pt-1 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3 h-1 bg-emerald-500 rounded-xs" />
                  <span>Free Flow (45+ km/h)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3 h-1 bg-amber-500 rounded-xs" />
                  <span>Moderate (20-35 km/h)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3 h-1 bg-rose-500 rounded-xs" />
                  <span>Severe Jam (&lt; 10 km/h)</span>
                </div>
              </div>
            )}
            {mapLayer === 'transit' && (
              <div className="pt-1 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3 h-1 bg-purple-400 rounded-xs" />
                  <span>Metro Line 1</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3 h-1 bg-cyan-400 rounded-xs" />
                  <span>Metro Line 2</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3 h-1 bg-emerald-400 rounded-xs" />
                  <span>BRT Bus Corridor</span>
                </div>
              </div>
            )}
          </div>

          {/* Zoom and Recenter Floating Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
            <button
              onClick={handleDetectGPS}
              className="bg-slate-900/90 hover:bg-slate-800 text-teal-300 border border-slate-700 p-2 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              title="Locate my position (GPS)"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedRegion('All')}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 p-2 rounded-xl shadow-lg transition active:scale-95 cursor-pointer text-[10px] font-bold"
              title="Reset View"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Selected Pin Quick-Drawer / Bottom Sheet */}
        {activePinDetail && (
          <div className="absolute bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 shadow-2xl z-40 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-bold border ${SECTOR_CONFIG[activePinDetail.category]?.bgBadge}`}>
                    {SECTOR_CONFIG[activePinDetail.category]?.label}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    {activePinDetail.talukOrWard}, {activePinDetail.district}
                  </span>
                  {activePinDetail.weatherRisk?.hasActiveRisk && (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 animate-pulse">
                      <CloudRain className="w-3 h-3 text-rose-400" />
                      IMD Warning: {activePinDetail.weatherRisk.forecastRainfallMm}mm
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {activePinDetail.title}
                </h4>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {activePinDetail.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => onUpvoteGrievance(activePinDetail.id, e)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                    activePinDetail.userHasUpvoted
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Impacts my family/ward too"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{activePinDetail.upvotesCount}</span>
                </button>

                <button
                  onClick={() => onSelectGrievance(activePinDetail)}
                  className="flex items-center gap-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md hover:from-teal-500 hover:to-emerald-500 cursor-pointer"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setActivePinDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
