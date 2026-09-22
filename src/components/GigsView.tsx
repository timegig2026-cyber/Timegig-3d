import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe,
  Locate,
  Layers,
  MapPin,
  AlertCircle,
  Building,
  Navigation,
  Sparkles,
  Plus,
  Briefcase,
  CheckCircle2,
  Search,
  X,
  Loader2,
  ChevronUp,
  Compass,
} from 'lucide-react';
import { ProfileData, MapGig, GeocodeLocation } from '../types';
import { getStoredMapGigs, GIG_CATEGORIES_METADATA } from '../lib/gigStore';
import { searchAddress } from '../lib/geocoding';
import { CreateMapGigModal } from './gigs/CreateMapGigModal';
import { GigDetailsModal } from './gigs/GigDetailsModal';
import { NearbyGigsDrawer } from './gigs/NearbyGigsDrawer';
import { AnimatePresence, motion } from 'motion/react';

export const GigsView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const osmLayerRef = useRef<L.TileLayer | null>(null);
  const satLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const gigMarkersRef = useRef<L.Marker[]>([]);

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

  // Floating Search Bar State
  const [isSearchBarHidden, setIsSearchBarHidden] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNearbyDrawerOpen, setIsNearbyDrawerOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Clicked location for creating a gig
  const [pendingGigLocation, setPendingGigLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Selected gig to view details and apply
  const [selectedGig, setSelectedGig] = useState<MapGig | null>(null);

  // Gigs list
  const [gigs, setGigs] = useState<MapGig[]>([]);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Load user profile
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

  // Fetch gigs
  const loadGigs = useCallback(() => {
    const list = getStoredMapGigs();
    setGigs(list);
  }, []);

  useEffect(() => {
    loadGigs();
    window.addEventListener('app-gigs-updated', loadGigs);
    return () => window.removeEventListener('app-gigs-updated', loadGigs);
  }, [loadGigs]);

  // Focus input when expanding floating search bar
  useEffect(() => {
    if (!isSearchBarHidden) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchBarHidden]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live geocoding for floating search bar
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    setIsDropdownOpen(true);

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAddress(val);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);
  };

  const handleSelectLocation = (loc: GeocodeLocation) => {
    setIsDropdownOpen(false);
    setSearchQuery(loc.display_name.split(',')[0]);
    navigateToCoordinates(parseFloat(loc.lat), parseFloat(loc.lon), loc.display_name, loc.address);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchAddress(searchQuery);
    setIsSearching(false);

    if (results.length > 0) {
      handleSelectLocation(results[0]);
    } else {
      setIsDropdownOpen(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  // Touch handlers to support pushing up floating search bar
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 25) {
      setIsSearchBarHidden(true);
    }
  };

  // Navigate map to coordinates
  const navigateToCoordinates = (
    lat: number,
    lng: number,
    displayName: string,
    address?: Record<string, string>
  ) => {
    const map = mapInstanceRef.current;
    if (!map || isNaN(lat) || isNaN(lng)) return;

    setActiveSearchResult({ displayName, lat, lng });

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const searchIcon = L.divIcon({
      className: 'custom-search-pin-leaflet',
      html: `
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
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([lat, lng], { icon: searchIcon }).addTo(map);
    marker
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; padding: 4px; max-width: 220px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 3px;">
            ${address?.road || displayName.split(',')[0]}
          </div>
          <div style="color: #64748b; font-size: 10px;">
            Exact Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
        </div>`
      )
      .openPopup();

    searchMarkerRef.current = marker;
    map.flyTo([lat, lng], 16, { duration: 1.5 });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [-28.5, 24.8],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
    });

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    });

    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri World Imagery',
      }
    );

    osmLayer.addTo(map);
    osmLayerRef.current = osmLayer;
    satLayerRef.current = satLayer;

    map.on('click', (e: L.LeafletMouseEvent) => {
      setPendingGigLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    });

    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    setTimeout(() => map.invalidateSize(), 300);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Satellite vs Standard view toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !osmLayerRef.current || !satLayerRef.current) return;

    if (mapLayerType === 'satellite') {
      if (map.hasLayer(osmLayerRef.current)) map.removeLayer(osmLayerRef.current);
      if (!map.hasLayer(satLayerRef.current)) satLayerRef.current.addTo(map);
    } else {
      if (map.hasLayer(satLayerRef.current)) map.removeLayer(satLayerRef.current);
      if (!map.hasLayer(osmLayerRef.current)) osmLayerRef.current.addTo(map);
    }
  }, [mapLayerType]);

  // Update Gig Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    gigMarkersRef.current.forEach((m) => m.remove());
    gigMarkersRef.current = [];

    gigs.forEach((gig) => {
      const meta = GIG_CATEGORIES_METADATA[gig.category] || GIG_CATEGORIES_METADATA.general;

      const customIcon = L.divIcon({
        className: 'custom-gig-pin-leaflet',
        html: `
          <div class="group relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95" style="width: 52px; height: 52px;">
            <div class="absolute inset-0 rounded-full bg-neutral-900/15 animate-ping"></div>
            <div class="relative flex flex-col items-center">
              <div class="px-2 py-0.5 bg-neutral-900 text-white rounded-full text-[9px] font-extrabold shadow-md mb-0.5 border border-white/40 whitespace-nowrap">
                ${gig.pay}
              </div>
              <div class="w-9 h-9 rounded-2xl bg-white border-2 border-neutral-900 shadow-xl flex items-center justify-center text-base">
                ${meta.icon}
              </div>
              <div class="w-2 h-2 bg-neutral-900 rotate-45 -mt-1 rounded-[1px]"></div>
            </div>
          </div>
        `,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      const marker = L.marker([gig.lat, gig.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedGig(gig);
      });

      gigMarkersRef.current.push(marker);
    });
  }, [gigs]);

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
      setUserLocation({ lat: latitude, lng: longitude, accuracy });
      setLocationError(null);
      setIsLocating(false);

      const map = mapInstanceRef.current;
      if (map) {
        const avatarUrl = userProfile?.profilePicture;
        const userIcon = L.divIcon({
          className: 'custom-user-pin-leaflet',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 48px; height: 48px;">
              <div class="absolute inset-0 rounded-full bg-sky-500/25 animate-ping"></div>
              <div class="absolute w-9 h-9 rounded-full bg-sky-500/35 backdrop-blur-xs"></div>
              <div class="relative w-8 h-8 rounded-full bg-white border-2 border-sky-500 shadow-md flex items-center justify-center overflow-hidden">
                ${
                  avatarUrl
                    ? `<img src="${avatarUrl}" alt="You" class="w-full h-full object-cover" />`
                    : `<div class="w-full h-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px]">You</div>`
                }
              </div>
              <div class="absolute -bottom-1 w-2 h-2 bg-sky-600 rotate-45 rounded-[1px]"></div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
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

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userProfile]);

  // Center on entire World
  const handleShowWorld = () => {
    mapInstanceRef.current?.setView([-28.5, 24.8], 3);
  };

  // Center on user's exact location
  const handleCenterOnUser = () => {
    if (!mapInstanceRef.current) return;
    if (userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.2 });
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

  const handleGigCreated = (newGig: MapGig) => {
    loadGigs();
    setActionToast(`GiG "${newGig.title}" pinned on map!`);
    setTimeout(() => setActionToast(null), 4000);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newGig.lat, newGig.lng], 16, { duration: 1.2 });
    }
  };

  return (
    <div
      id="gigs-view"
      className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-neutral-100 overflow-hidden"
      aria-label="GiGs OpenStreetMap and Satellite View"
    >
      {/* Full-screen Map Canvas */}
      <div
        ref={mapContainerRef}
        id="openstreetmap-canvas"
        className="w-full h-full min-h-full flex-1 z-0 bg-neutral-200 cursor-crosshair"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      />

      {/* Floating Search Bar on Top of Map */}
      <div className="absolute top-4 left-4 right-4 z-30 pointer-events-auto">
        {isSearchBarHidden ? (
          <div className="flex items-center gap-2">
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              id="btn-floating-search-icon"
              type="button"
              onClick={() => setIsSearchBarHidden(false)}
              title="Search home no., street, city, province..."
              className="w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-lg flex items-center justify-center text-neutral-800 hover:text-sky-600 hover:bg-white cursor-pointer active:scale-95 transition-all"
            >
              <Search className="w-5 h-5 text-neutral-700 hover:text-sky-600" />
            </motion.button>

            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              id="btn-floating-nearby-icon"
              type="button"
              onClick={() => setIsNearbyDrawerOpen(true)}
              title="View all nearby GiGs"
              className="px-3.5 h-11 bg-neutral-900 text-white border border-neutral-800 rounded-2xl shadow-lg flex items-center gap-2 hover:bg-neutral-800 cursor-pointer active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">Nearby</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-900 rounded-full text-[10px] font-extrabold">
                {gigs.length}
              </span>
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            ref={searchContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full flex items-center gap-2"
          >
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <div className="relative w-full flex items-center bg-white/95 backdrop-blur-md focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-neutral-200/90 rounded-2xl transition-all shadow-lg">
                <Search className="w-4 h-4 text-neutral-400 ml-3.5 shrink-0" />
                <input
                  ref={searchInputRef}
                  id="floating-location-search"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchResults.length > 0 || searchQuery.length >= 2) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  placeholder="Search home no., street, location, province..."
                  className="w-full bg-transparent text-xs py-3 px-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
                  autoComplete="off"
                />

                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-neutral-400 mr-3 animate-spin shrink-0" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1.5 mr-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  id="btn-push-up-search-bar"
                  type="button"
                  onClick={() => setIsSearchBarHidden(true)}
                  title="Push up to collapse into small search icon"
                  className="p-2 mr-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </form>

            <button
              id="btn-nearby-gigs-top-bar"
              type="button"
              onClick={() => setIsNearbyDrawerOpen(true)}
              title="View all nearby GiGs"
              className="h-11 px-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl shadow-lg border border-neutral-800 flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold hidden sm:inline">Nearby</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-900 rounded-full text-[10px] font-extrabold">
                {gigs.length}
              </span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200 shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto"
                >
                  {isSearching && searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      <span>Searching global locations...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Suggested Locations & Addresses
                      </div>
                      {searchResults.map((loc) => {
                        const address = loc.address;
                        const house = address?.house_number;
                        const road = address?.road;
                        const city =
                          address?.city || address?.town || address?.village || address?.suburb;
                        const province = address?.state || address?.province;
                        const country = address?.country;

                        const primaryText =
                          [house, road].filter(Boolean).join(' ') ||
                          loc.display_name.split(',')[0];
                        const secondaryText =
                          [city, province, country].filter(Boolean).join(', ') ||
                          loc.display_name;

                        return (
                          <button
                            key={loc.place_id}
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full px-3.5 py-2.5 text-left hover:bg-neutral-50 flex items-start gap-2.5 transition-colors cursor-pointer border-b border-neutral-50 last:border-0"
                          >
                            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                              {house ? (
                                <Building className="w-3.5 h-3.5" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-neutral-900 truncate">
                                {primaryText}
                              </p>
                              <p className="text-[11px] text-neutral-500 truncate">
                                {secondaryText}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-xs text-neutral-500">
                      <p className="font-semibold text-neutral-700">No exact location found</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Try searching by street name, city, or province name
                      </p>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating Interactive Toast */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-4 right-4 z-30 bg-emerald-950 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between border border-emerald-800"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold truncate">{actionToast}</span>
            </div>
            <button
              onClick={() => setActionToast(null)}
              className="text-neutral-400 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Active Search Result Banner */}
      {activeSearchResult && (
        <div className="absolute top-20 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-2.5 px-3.5 shadow-md flex items-center justify-between gap-2">
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
        <div className="absolute top-20 left-4 right-4 z-20 bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 shadow-sm flex items-start gap-2">
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

      {/* Map Hint Pill at Bottom Left */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <div className="bg-neutral-900/90 backdrop-blur-md text-white rounded-2xl px-3 py-1.5 text-[11px] font-semibold shadow-lg flex items-center gap-1.5 border border-neutral-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Click anywhere to create a GiG</span>
        </div>

        <div className="bg-white/90 backdrop-blur-xs border border-neutral-200/80 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-neutral-700 shadow-2xs flex items-center gap-1.5 w-fit">
          <span
            className={`w-2 h-2 rounded-full ${
              mapLayerType === 'satellite' ? 'bg-amber-500 animate-pulse' : 'bg-sky-500'
            }`}
          />
          <span className="capitalize">{mapLayerType} View</span>
          <span className="text-neutral-400">· {gigs.length} GiGs active</span>
        </div>
      </div>

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col gap-2">
        {/* Nearby GiGs Icon Control Button */}
        <button
          id="btn-nearby-gigs-floating-ctrl"
          type="button"
          onClick={() => setIsNearbyDrawerOpen(true)}
          title="See All Nearby GiGs"
          className="w-11 h-11 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-700 rounded-2xl shadow-lg flex items-center justify-center transition-all cursor-pointer group active:scale-95"
        >
          <Compass className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

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

      {/* Create GiG at Clicked Location Modal */}
      <AnimatePresence>
        {pendingGigLocation && (
          <CreateMapGigModal
            lat={pendingGigLocation.lat}
            lng={pendingGigLocation.lng}
            onClose={() => setPendingGigLocation(null)}
            onGigCreated={handleGigCreated}
          />
        )}
      </AnimatePresence>

      {/* Gig Details & Apply Modal */}
      <AnimatePresence>
        {selectedGig && (
          <GigDetailsModal
            gig={selectedGig}
            onClose={() => setSelectedGig(null)}
            onApplied={() => {
              loadGigs();
              setActionToast(`Application sent to ${selectedGig.posterName}!`);
              setTimeout(() => setActionToast(null), 4000);
            }}
          />
        )}
      </AnimatePresence>

      {/* Nearby GiGs Drawer */}
      <AnimatePresence>
        {isNearbyDrawerOpen && (
          <NearbyGigsDrawer
            gigs={gigs}
            userLocation={userLocation}
            onClose={() => setIsNearbyDrawerOpen(false)}
            onSelectGig={(gig) => {
              setIsNearbyDrawerOpen(false);
              navigateToCoordinates(gig.lat, gig.lng, gig.title);
              setSelectedGig(gig);
            }}
            onCreateGigPrompt={() => {
              setPendingGigLocation(userLocation || { lat: 20, lng: 0 });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
