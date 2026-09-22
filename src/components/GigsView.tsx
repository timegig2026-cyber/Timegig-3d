import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Globe,
  Locate,
  Layers,
  MapPin,
  AlertCircle,
  Building,
  Navigation,
} from 'lucide-react';
import { ProfileData } from '../types';

export const GigsView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  const baseLayerStandardRef = useRef<L.TileLayer | null>(null);
  const baseLayerSatelliteRef = useRef<L.TileLayer | null>(null);
  const satelliteLabelsRef = useRef<L.TileLayer | null>(null);

  const [mapLayerType, setMapLayerType] = useState<'standard' | 'satellite'>('standard');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [activeSearchResult, setActiveSearchResult] = useState<{
    displayName: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Load user profile picture if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_user_profile');
      if (saved) {
        setUserProfile(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize Leaflet Map configured to show the entire world
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const container = mapContainerRef.current;

    // World view center & zoom
    const worldCenterLat = 20;
    const worldCenterLng = 0;
    const worldZoom = 2;

    const map = L.map(container, {
      center: [worldCenterLat, worldCenterLng],
      zoom: worldZoom,
      minZoom: 1.5,
      maxZoom: 19,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: false,
    });

    // 1. Standard OpenStreetMap Layer
    const standardLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 1.5,
      attribution: '&copy; OpenStreetMap contributors',
    });

    // 2. High Resolution World Satellite Imagery Layer (ESRI World Imagery)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        minZoom: 1.5,
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      }
    );

    // 3. Satellite Place & Street Labels Overlay
    const labelsLayer = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        minZoom: 1.5,
        opacity: 0.85,
      }
    );

    baseLayerStandardRef.current = standardLayer;
    baseLayerSatelliteRef.current = satelliteLayer;
    satelliteLabelsRef.current = labelsLayer;

    // Default to standard layer
    standardLayer.addTo(map);

    mapInstanceRef.current = map;

    // Size invalidation triggers
    const triggerInvalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    triggerInvalidate();
    const t1 = setTimeout(triggerInvalidate, 100);
    const t2 = setTimeout(triggerInvalidate, 400);
    const t3 = setTimeout(triggerInvalidate, 800);

    const resizeObserver = new ResizeObserver(() => triggerInvalidate());
    resizeObserver.observe(container);

    window.addEventListener('resize', triggerInvalidate);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      window.removeEventListener('resize', triggerInvalidate);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch between Standard and Satellite views
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (mapLayerType === 'satellite') {
      if (baseLayerStandardRef.current && map.hasLayer(baseLayerStandardRef.current)) {
        map.removeLayer(baseLayerStandardRef.current);
      }
      if (baseLayerSatelliteRef.current) {
        baseLayerSatelliteRef.current.addTo(map);
      }
      if (satelliteLabelsRef.current) {
        satelliteLabelsRef.current.addTo(map);
      }
    } else {
      if (baseLayerSatelliteRef.current && map.hasLayer(baseLayerSatelliteRef.current)) {
        map.removeLayer(baseLayerSatelliteRef.current);
      }
      if (satelliteLabelsRef.current && map.hasLayer(satelliteLabelsRef.current)) {
        map.removeLayer(satelliteLabelsRef.current);
      }
      if (baseLayerStandardRef.current) {
        baseLayerStandardRef.current.addTo(map);
      }
    }
  }, [mapLayerType]);

  // Listen for Top Bar Geocoded Location Search Navigation
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        lat: number;
        lng: number;
        displayName: string;
        address?: Record<string, string>;
      }>;
      const { lat, lng, displayName, address } = customEvent.detail;
      if (!mapInstanceRef.current || isNaN(lat) || isNaN(lng)) return;

      const map = mapInstanceRef.current;
      setActiveSearchResult({ displayName, lat, lng });

      // Custom Red Pin for Searched Exact Address
      const searchPinHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 44px; height: 44px;">
          <div class="absolute inset-0 rounded-full bg-rose-500/25 animate-ping"></div>
          <div class="relative w-9 h-9 rounded-2xl bg-rose-600 text-white shadow-xl flex items-center justify-center border-2 border-white">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="absolute -bottom-1.5 w-2.5 h-2.5 bg-rose-700 rotate-45"></div>
        </div>
      `;

      const searchIcon = L.divIcon({
        className: 'custom-search-map-pin',
        html: searchPinHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Place or update search marker
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setLatLng([lat, lng]);
        searchMarkerRef.current.setIcon(searchIcon);
      } else {
        searchMarkerRef.current = L.marker([lat, lng], {
          icon: searchIcon,
          zIndexOffset: 2000,
        }).addTo(map);
      }

      const houseNumber = address?.house_number;
      const road = address?.road;
      const city = address?.city || address?.town || address?.village || address?.suburb;
      const province = address?.state || address?.province;
      const country = address?.country;

      searchMarkerRef.current.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px; max-width: 220px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 3px;">
            ${[houseNumber, road].filter(Boolean).join(' ') || displayName.split(',')[0]}
          </div>
          ${city || province ? `<div style="color: #475569; font-size: 11px; margin-bottom: 2px;">${[city, province].filter(Boolean).join(', ')}</div>` : ''}
          ${country ? `<div style="color: #64748b; font-size: 10px;">${country}</div>` : ''}
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; color: #0284c7; font-size: 10px; font-weight: 600;">
            Exact Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
        </div>
      `);

      // Fly map smoothly directly to exact location with street-level zoom
      map.flyTo([lat, lng], 17, {
        duration: 1.5,
        easeLinearity: 0.25,
      });

      setTimeout(() => {
        if (searchMarkerRef.current) {
          searchMarkerRef.current.openPopup();
        }
      }, 1600);
    };

    window.addEventListener('map-navigate-to-location', handleNavigate);
    return () => window.removeEventListener('map-navigate-to-location', handleNavigate);
  }, []);

  // Request & Watch Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const coords = { lat: latitude, lng: longitude, accuracy };
      setUserLocation(coords);
      setLocationError(null);
      setIsLocating(false);

      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;

        const avatarUrl = userProfile?.profilePicture;
        const iconHtml = `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 48px; height: 48px;">
            <!-- Outer Pulsing Radar Wave -->
            <div class="absolute inset-0 rounded-full bg-sky-500/25 animate-ping"></div>
            <!-- Middle Glowing Halo -->
            <div class="absolute w-9 h-9 rounded-full bg-sky-500/35 backdrop-blur-xs"></div>
            <!-- Center Avatar Marker -->
            <div class="relative w-8 h-8 rounded-full bg-white border-2 border-sky-500 shadow-md flex items-center justify-center overflow-hidden">
              ${
                avatarUrl
                  ? `<img src="${avatarUrl}" alt="You" class="w-full h-full object-cover" />`
                  : `<div class="w-full h-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px]">You</div>`
              }
            </div>
            <!-- Bottom Pointer Pin -->
            <div class="absolute -bottom-1 w-2 h-2 bg-sky-600 rotate-45 rounded-[1px]"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-user-map-pin',
          html: iconHtml,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        // Update or Create Marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
          userMarkerRef.current.setIcon(customIcon);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: customIcon,
            zIndexOffset: 1000,
          }).addTo(map);

          userMarkerRef.current.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
              <strong style="color: #0f172a; display: block; font-size: 13px; margin-bottom: 2px;">Your Exact Location</strong>
              <span style="color: #64748b; font-size: 11px;">Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}</span>
              ${accuracy ? `<br/><span style="color: #0284c7; font-size: 10px; font-weight: 600;">Accuracy: ~${Math.round(accuracy)}m</span>` : ''}
            </div>
          `);
        }

        // Accuracy Circle
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng([latitude, longitude]);
          accuracyCircleRef.current.setRadius(accuracy || 30);
        } else {
          accuracyCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy || 30,
            color: '#0284c7',
            weight: 1,
            fillColor: '#38bdf8',
            fillOpacity: 0.12,
          }).addTo(map);
        }
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('Geolocation error:', err.message);
      setLocationError(
        err.code === 1
          ? 'Location permission denied. Use top search or tap "Locate Me".'
          : 'Could not fetch precise GPS coordinates.'
      );
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userProfile]);

  // Center on entire World
  const handleShowWorld = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([20, 0], 2, { duration: 1.2 });
  };

  // Center on user's exact location
  const handleCenterOnUser = () => {
    if (!mapInstanceRef.current) return;
    if (userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1.2,
      });
      if (userMarkerRef.current) {
        userMarkerRef.current.openPopup();
      }
    } else {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude, accuracy });
          mapInstanceRef.current?.flyTo([latitude, longitude], 16, { duration: 1.2 });
          setIsLocating(false);
        },
        (err) => {
          setLocationError('Could not fetch GPS: ' + err.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      id="gigs-view"
      className="relative w-full h-[calc(100vh-8rem)] min-h-[500px] flex flex-col bg-neutral-100 overflow-hidden"
      aria-label="GiGs OpenStreetMap and Satellite View"
    >
      {/* Full-screen Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        id="openstreetmap-canvas"
        className="w-full h-full min-h-full flex-1 z-0 bg-neutral-200"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      />

      {/* Floating Active Search Result Banner */}
      {activeSearchResult && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-2.5 px-3.5 shadow-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {activeSearchResult.displayName.split(',')[0]}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">
                {activeSearchResult.displayName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveSearchResult(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Location Error Warning Toast */}
      {locationError && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 shadow-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="flex-1 text-[11px] leading-tight">{locationError}</p>
          <button
            onClick={() => setLocationError(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col gap-2">
        {/* Toggle Satellite View vs Standard Map */}
        <button
          id="btn-toggle-satellite-view"
          type="button"
          onClick={() =>
            setMapLayerType((prev) => (prev === 'standard' ? 'satellite' : 'standard'))
          }
          title={
            mapLayerType === 'standard'
              ? 'Switch to Satellite Imagery View'
              : 'Switch to Standard Map View'
          }
          className={`w-11 h-11 backdrop-blur-md border rounded-2xl shadow-md flex items-center justify-center transition-all cursor-pointer group active:scale-95 ${
            mapLayerType === 'satellite'
              ? 'bg-neutral-900 border-neutral-700 text-amber-400 shadow-amber-500/10'
              : 'bg-white/95 border-neutral-200/90 text-neutral-800 hover:text-sky-600 hover:bg-white'
          }`}
        >
          <Layers className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Reset to Entire World View */}
        <button
          id="btn-show-world-view"
          type="button"
          onClick={handleShowWorld}
          title="Show Entire World Map"
          className="w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-md text-neutral-800 hover:text-sky-600 hover:bg-white flex items-center justify-center transition-all cursor-pointer group active:scale-95"
        >
          <Globe className="w-5 h-5 transition-transform group-hover:scale-110 text-neutral-700 group-hover:text-sky-600" />
        </button>

        {/* Recenter on User Exact Location */}
        <button
          id="btn-recenter-location"
          type="button"
          onClick={handleCenterOnUser}
          title="Zoom to My Exact Location"
          className="w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-md text-neutral-800 hover:text-sky-600 hover:bg-white flex items-center justify-center transition-all cursor-pointer group active:scale-95"
        >
          <Locate
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              userLocation ? 'text-sky-600' : 'text-neutral-600'
            }`}
          />
        </button>

        {/* Zoom In & Out */}
        <div className="bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-md flex flex-col overflow-hidden">
          <button
            id="btn-map-zoom-in"
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-11 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors border-b border-neutral-100 text-sm font-bold cursor-pointer"
          >
            +
          </button>
          <button
            id="btn-map-zoom-out"
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-11 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors text-sm font-bold cursor-pointer"
          >
            −
          </button>
        </div>
      </div>

      {/* Layer Mode Pill Indicator (Bottom Left) */}
      <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-xs border border-neutral-200/80 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-neutral-700 shadow-2xs flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              mapLayerType === 'satellite' ? 'bg-amber-500 animate-pulse' : 'bg-sky-500'
            }`}
          />
          <span className="capitalize">{mapLayerType} View</span>
        </div>
      </div>
    </div>
  );
};
