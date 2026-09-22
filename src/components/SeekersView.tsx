import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Globe,
  Locate,
  Layers,
  MapPin,
  AlertCircle,
  Building,
  UserCheck,
  ShieldCheck,
  Star,
  Briefcase,
  Search,
  X,
  Loader2,
  ChevronUp,
  CheckCircle2,
  List,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { SubmissionRecord, GeocodeLocation, ProfileData, HireProposal } from '../types';
import {
  getApprovedSeekers,
  getUserAvailability,
  getHireProposals,
} from '../lib/activityStore';
import { searchAddress } from '../lib/geocoding';
import { HireSeekerModal } from './seekers/HireSeekerModal';
import { SeekerAvailabilityModal } from './seekers/SeekerAvailabilityModal';
import { AnimatePresence, motion } from 'motion/react';

const CATEGORIES = [
  'All',
  'Design & UI',
  'Developers & Tech',
  'Architecture & 3D',
  'Skilled Trades & Solar',
];

export const SeekersView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const seekerMarkersLayerRef = useRef<L.LayerGroup | null>(null);

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

  // Seekers & Hiring State
  const [seekers, setSeekers] = useState<SubmissionRecord[]>([]);
  const [selectedSeekerForHire, setSelectedSeekerForHire] = useState<SubmissionRecord | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState<boolean>(false);
  const [isCurrentUserAvailable, setIsCurrentUserAvailable] = useState<boolean>(false);
  const [showListDrawer, setShowListDrawer] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hireToast, setHireToast] = useState<string | null>(null);

  // Floating Search Bar State
  const [isSearchBarHidden, setIsSearchBarHidden] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSearchResult, setActiveSearchResult] = useState<{
    displayName: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Load user profile & seekers data
  const loadSeekersData = useCallback(() => {
    try {
      const saved = localStorage.getItem('app_user_profile');
      if (saved) {
        setUserProfile(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    const list = getApprovedSeekers();
    setSeekers(list);
    setIsCurrentUserAvailable(getUserAvailability());
  }, []);

  useEffect(() => {
    loadSeekersData();

    window.addEventListener('app-availability-updated', loadSeekersData);
    window.addEventListener('app-profile-updated', loadSeekersData);
    window.addEventListener('app-hires-updated', loadSeekersData);
    window.addEventListener('app-activity-updated', loadSeekersData);

    return () => {
      window.removeEventListener('app-availability-updated', loadSeekersData);
      window.removeEventListener('app-profile-updated', loadSeekersData);
      window.removeEventListener('app-hires-updated', loadSeekersData);
      window.removeEventListener('app-activity-updated', loadSeekersData);
    };
  }, [loadSeekersData]);

  // Focus input when expanding search bar
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

  // Debounced search for address or seeker name
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

    // Check if matching a seeker directly first
    const matchedSeeker = seekers.find(
      (s) =>
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.occupation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchedSeeker) {
      setSelectedSeekerForHire(matchedSeeker);
      setIsDropdownOpen(false);
      return;
    }

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

  // Touch handlers to support pushing up search bar
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
    if (!mapInstanceRef.current || isNaN(lat) || isNaN(lng)) return;

    const map = mapInstanceRef.current;
    setActiveSearchResult({ displayName, lat, lng });

    const searchPinHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 44px; height: 44px;">
        <div class="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping"></div>
        <div class="relative w-9 h-9 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-center border-2 border-white">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="absolute -bottom-1.5 w-2.5 h-2.5 bg-emerald-700 rotate-45"></div>
      </div>
    `;

    const searchIcon = L.divIcon({
      className: 'custom-search-map-pin',
      html: searchPinHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

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
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; color: #059669; font-size: 10px; font-weight: 600;">
          Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}
        </div>
      </div>
    `);

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

  // Initialize Leaflet Map configured to show the entire world
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const container = mapContainerRef.current;

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

    // 2. High Resolution World Satellite Imagery Layer
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

    standardLayer.addTo(map);

    // Seeker markers group
    const seekerGroup = L.layerGroup().addTo(map);
    seekerMarkersLayerRef.current = seekerGroup;

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

  // Update Seeker Pins on the Map whenever `seekers`, `selectedCategory`, or `userLocation` changes
  useEffect(() => {
    if (!mapInstanceRef.current || !seekerMarkersLayerRef.current) return;
    const seekerGroup = seekerMarkersLayerRef.current;
    seekerGroup.clearLayers();

    // Filter seekers by category and query
    const filtered = seekers.filter((seeker) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        seeker.fullName.toLowerCase().includes(q) ||
        seeker.occupation.toLowerCase().includes(q) ||
        seeker.location.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Design & UI') {
        return (
          seeker.occupation.toLowerCase().includes('design') ||
          seeker.occupation.toLowerCase().includes('ui')
        );
      }
      if (selectedCategory === 'Developers & Tech') {
        return (
          seeker.occupation.toLowerCase().includes('developer') ||
          seeker.occupation.toLowerCase().includes('tech') ||
          seeker.occupation.toLowerCase().includes('cloud')
        );
      }
      if (selectedCategory === 'Architecture & 3D') {
        return (
          seeker.occupation.toLowerCase().includes('architect') ||
          seeker.occupation.toLowerCase().includes('3d') ||
          seeker.occupation.toLowerCase().includes('cad')
        );
      }
      if (selectedCategory === 'Skilled Trades & Solar') {
        return (
          seeker.occupation.toLowerCase().includes('electric') ||
          seeker.occupation.toLowerCase().includes('solar') ||
          seeker.occupation.toLowerCase().includes('contractor')
        );
      }
      return true;
    });

    // Place pin for each verified seeker
    filtered.forEach((seeker, idx) => {
      let lat = seeker.lat;
      let lng = seeker.lng;

      // If seeker is current user, prefer real GPS
      if (seeker.isCurrentUser && userLocation) {
        lat = userLocation.lat;
        lng = userLocation.lng;
      }

      // If coordinates not set, generate stable geocoded offset around world clusters
      if (!lat || !lng) {
        // Deterministic offset based on ID/name
        const hash = (seeker.id || seeker.fullName).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const latClusters = [37.7749, 40.7128, 51.5074, 48.8566, 35.6762, -33.8688, 25.2048, 1.3521];
        const lngClusters = [-122.4194, -74.006, -0.1278, 2.3522, 139.6503, 151.2093, 55.2708, 103.8198];
        const clusterIndex = hash % latClusters.length;
        lat = latClusters[clusterIndex] + (((hash * 13) % 20) - 10) * 0.04;
        lng = lngClusters[clusterIndex] + (((hash * 17) % 20) - 10) * 0.04;
      }

      const avatarUrl = seeker.profilePicture;
      const initial = seeker.fullName.charAt(0) || 'U';

      const seekerPinHtml = `
        <div class="group relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95" style="width: 54px; height: 54px;">
          <!-- Radar Pulse Wave -->
          <div class="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
          
          <!-- Seeker Pin Body -->
          <div class="relative flex flex-col items-center">
            <!-- Rate Badge -->
            <div class="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded-full text-[9px] font-extrabold shadow-md mb-0.5 border border-emerald-500/40 whitespace-nowrap">
              ${seeker.hourlyRate || '$50/hr'}
            </div>
            
            <!-- Avatar Container -->
            <div class="relative w-10 h-10 rounded-2xl bg-white border-2 border-emerald-600 shadow-xl flex items-center justify-center overflow-hidden">
              ${
                avatarUrl
                  ? `<img src="${avatarUrl}" alt="${seeker.fullName}" class="w-full h-full object-cover" />`
                  : `<span class="font-bold text-neutral-800 text-xs">${initial}</span>`
              }
              <!-- Verified Shield Badge -->
              <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-white text-[8px]">
                ✓
              </div>
            </div>
            
            <!-- Pointer Pin -->
            <div class="w-2 h-2 bg-emerald-700 rotate-45 -mt-1 rounded-[1px]"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-seeker-map-pin',
        html: seekerPinHtml,
        iconSize: [54, 54],
        iconAnchor: [27, 34],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: 600 + idx,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedSeekerForHire(seeker);
      });

      seekerGroup.addLayer(marker);
    });
  }, [seekers, selectedCategory, searchQuery, userLocation]);

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
            <div class="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping"></div>
            <div class="absolute w-9 h-9 rounded-full bg-emerald-500/35 backdrop-blur-xs"></div>
            <div class="relative w-8 h-8 rounded-full bg-white border-2 border-emerald-500 shadow-md flex items-center justify-center overflow-hidden">
              ${
                avatarUrl
                  ? `<img src="${avatarUrl}" alt="You" class="w-full h-full object-cover" />`
                  : `<div class="w-full h-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px]">You</div>`
              }
            </div>
            <div class="absolute -bottom-1 w-2 h-2 bg-emerald-600 rotate-45 rounded-[1px]"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-user-map-pin',
          html: iconHtml,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

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
              ${accuracy ? `<br/><span style="color: #059669; font-size: 10px; font-weight: 600;">Accuracy: ~${Math.round(accuracy)}m</span>` : ''}
            </div>
          `);
        }

        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng([latitude, longitude]);
          accuracyCircleRef.current.setRadius(accuracy || 30);
        } else {
          accuracyCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy || 30,
            color: '#059669',
            weight: 1,
            fillColor: '#10b981',
            fillOpacity: 0.12,
          }).addTo(map);
        }
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('Geolocation error:', err.message);
      setLocationError(
        err.code === 1
          ? 'Location permission denied. Tap "Locate Me" or use top search.'
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

  const handleHireSuccess = () => {
    setHireToast('Hire proposal sent! Tracked in your activity history.');
    loadSeekersData();
    setTimeout(() => setHireToast(null), 4000);
  };

  return (
    <div
      id="seekers-view"
      className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-neutral-100 overflow-hidden"
      aria-label="Seekers OpenStreetMap and Satellite View"
    >
      {/* Full-screen Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        id="openstreetmap-canvas-seekers"
        className="w-full h-full min-h-full flex-1 z-0 bg-neutral-200"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      />

      {/* Floating Top Bar (Floating Search + Get Hired Button) */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        {isSearchBarHidden ? (
          /* Small Floating Search Icon Button */
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            id="btn-floating-search-icon-seekers"
            type="button"
            onClick={() => setIsSearchBarHidden(false)}
            title="Search seekers by role, skill, location..."
            className="w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-lg flex items-center justify-center text-neutral-800 hover:text-emerald-600 hover:bg-white cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <Search className="w-5 h-5 text-neutral-700 hover:text-emerald-600" />
          </motion.button>
        ) : (
          /* Full Floating Search Bar */
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            ref={searchContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative flex-1 min-w-0"
          >
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <div className="relative w-full flex items-center bg-white/95 backdrop-blur-md focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-neutral-200/90 rounded-2xl transition-all shadow-lg">
                <Search className="w-4 h-4 text-neutral-400 ml-3.5 shrink-0" />
                <input
                  ref={searchInputRef}
                  id="floating-seekers-search"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchResults.length > 0 || searchQuery.length >= 2) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  placeholder="Search seeker name, skills, street, city..."
                  className="w-full bg-transparent text-xs py-3 px-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
                  autoComplete="off"
                />

                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-neutral-400 mr-3 animate-spin shrink-0" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1.5 mr-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}

                {/* Push-Up Button to hide into small search icon */}
                <button
                  id="btn-push-up-seekers-search"
                  type="button"
                  onClick={() => setIsSearchBarHidden(true)}
                  title="Push up to collapse into small search icon"
                  className="p-2 mr-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown List */}
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
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
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

        {/* Floating "Get Hired / Available" Action Button */}
        <button
          id="btn-floating-get-hired"
          type="button"
          onClick={() => setShowAvailabilityModal(true)}
          title="Appear in Seekers feature to get hired"
          className={`h-11 px-3.5 backdrop-blur-md border rounded-2xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
            isCurrentUserAvailable
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20'
              : 'bg-white/95 border-neutral-200/90 text-neutral-800 hover:bg-white'
          }`}
        >
          <div className="relative">
            <UserCheck
              className={`w-4 h-4 ${
                isCurrentUserAvailable ? 'text-white' : 'text-neutral-700'
              }`}
            />
            {isCurrentUserAvailable && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            )}
          </div>
          <span className="hidden sm:inline">
            {isCurrentUserAvailable ? 'Available' : 'Get Hired'}
          </span>
        </button>

        {/* List Drawer Toggle Button */}
        <button
          id="btn-toggle-seekers-list"
          type="button"
          onClick={() => setShowListDrawer((prev) => !prev)}
          title="View all approved seekers in list view"
          className="w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-lg flex items-center justify-center text-neutral-800 hover:text-emerald-600 hover:bg-white cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <List className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      {/* Category Pills Bar (Floating right beneath the search bar) */}
      <div className="absolute top-18 left-4 right-4 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer backdrop-blur-md shadow-sm ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-md'
                : 'bg-white/90 text-neutral-700 hover:bg-white border border-neutral-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Floating Interactive Toast */}
      <AnimatePresence>
        {hireToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-28 left-4 right-4 z-30 bg-emerald-950 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between border border-emerald-800"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold truncate">{hireToast}</span>
            </div>
            <button
              onClick={() => setHireToast(null)}
              className="text-neutral-400 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Active Search Result Banner */}
      {activeSearchResult && (
        <div className="absolute top-28 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-2.5 px-3.5 shadow-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
        <div className="absolute top-28 left-4 right-4 z-20 bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 shadow-sm flex items-start gap-2">
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
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click any verified seeker to hire</span>
        </div>

        <div className="bg-white/90 backdrop-blur-xs border border-neutral-200/80 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-neutral-700 shadow-2xs flex items-center gap-1.5 w-fit">
          <span
            className={`w-2 h-2 rounded-full ${
              mapLayerType === 'satellite' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="capitalize">{mapLayerType} View</span>
          <span className="text-neutral-400">· {seekers.length} Seekers active</span>
        </div>
      </div>

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col gap-2">
        {/* Toggle Satellite View vs Standard Map */}
        <button
          id="btn-toggle-satellite-view-seekers"
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
              : 'bg-white/95 border-neutral-200/90 text-neutral-800 hover:text-emerald-600 hover:bg-white'
          }`}
        >
          <Layers className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Reset to Entire World View */}
        <button
          id="btn-show-world-view-seekers"
          type="button"
          onClick={handleShowWorld}
          title="Show Entire World Map"
          className="w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-md text-neutral-800 hover:text-emerald-600 hover:bg-white flex items-center justify-center transition-all cursor-pointer group active:scale-95"
        >
          <Globe className="w-5 h-5 transition-transform group-hover:scale-110 text-neutral-700 group-hover:text-emerald-600" />
        </button>

        {/* Recenter on User Exact Location */}
        <button
          id="btn-recenter-location-seekers"
          type="button"
          onClick={handleCenterOnUser}
          title="Zoom to My Exact Location"
          className="w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-md text-neutral-800 hover:text-emerald-600 hover:bg-white flex items-center justify-center transition-all cursor-pointer group active:scale-95"
        >
          <Locate
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              userLocation ? 'text-emerald-600' : 'text-neutral-600'
            }`}
          />
        </button>

        {/* Zoom In & Out */}
        <div className="bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-md flex flex-col overflow-hidden">
          <button
            id="btn-map-zoom-in-seekers"
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-11 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors border-b border-neutral-100 text-sm font-bold cursor-pointer"
          >
            +
          </button>
          <button
            id="btn-map-zoom-out-seekers"
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-11 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors text-sm font-bold cursor-pointer"
          >
            −
          </button>
        </div>
      </div>

      {/* Slide-Up Seekers List Sheet / Drawer */}
      <AnimatePresence>
        {showListDrawer && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 max-h-[75vh] bg-white rounded-t-3xl shadow-2xl border-t border-neutral-200 z-40 flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Approved Verified Seekers ({seekers.length})
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Tap any profile to view details or send a hiring offer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowListDrawer(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {seekers.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 text-xs">
                  No verified seekers yet. Tap "Get Hired" to activate your verified seeker profile!
                </div>
              ) : (
                seekers.map((seeker) => (
                  <div
                    key={seeker.id}
                    onClick={() => {
                      setSelectedSeekerForHire(seeker);
                      setShowListDrawer(false);
                    }}
                    className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-xl bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {seeker.profilePicture ? (
                          <img
                            src={seeker.profilePicture}
                            alt={seeker.fullName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-neutral-700 text-sm">
                            {seeker.fullName.charAt(0) || 'U'}
                          </span>
                        )}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-[7px] text-white">
                          ✓
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {seeker.fullName}
                          </h4>
                          {seeker.isCurrentUser && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-600 truncate">
                          {seeker.occupation}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {seeker.location || 'Worldwide'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                        {seeker.hourlyRate || '$50/hr'}
                      </span>
                      <div className="flex items-center justify-end gap-0.5 text-[10px] text-amber-600 font-bold mt-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-500" />
                        <span>{seeker.rating || 5.0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seeker Availability Modal */}
      <AnimatePresence>
        {showAvailabilityModal && (
          <SeekerAvailabilityModal
            onClose={() => setShowAvailabilityModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Hire Proposal Modal */}
      <AnimatePresence>
        {selectedSeekerForHire && (
          <HireSeekerModal
            seeker={selectedSeekerForHire}
            onClose={() => setSelectedSeekerForHire(null)}
            onSuccess={handleHireSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
