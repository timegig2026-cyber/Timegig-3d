import React, { useState, useEffect, useRef } from 'react';
import { TabType, GeocodeLocation } from '../types';
import { RealisticAdminIcon } from './RealisticIcons';
import { AdminPortal } from './admin/AdminPortal';
import { motion, AnimatePresence } from 'motion/react';
import { useUserProfile } from '../lib/useUserProfile';
import { searchAddress } from '../lib/geocoding';
import {
  ShieldCheck,
  Search,
  MapPin,
  X,
  Loader2,
  Navigation,
  Building,
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  onTabChange?: (tab: TabType) => void;
  onProfileReviewed?: () => void;
  onAdminToggle?: (isOpen: boolean) => void;
}

const TAB_TITLES: Record<TabType, string> = {
  seekers: 'Seekers',
  gigs: 'GiGs',
  profile: 'Profile',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onProfileReviewed,
  onAdminToggle,
}) => {
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const currentTitle = TAB_TITLES[activeTab];
  const userProfile = useUserProfile();
  const profilePic = userProfile?.profilePicture;
  const isApproved = userProfile?.status === 'approved';

  // Search Bar State in Top Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced live geocoding
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

    if (activeTab !== 'gigs' && onTabChange) {
      onTabChange('gigs');
    }

    // Dispatch event for GigsView map to fly to exact coordinates
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('map-navigate-to-location', {
          detail: {
            lat: parseFloat(loc.lat),
            lng: parseFloat(loc.lon),
            displayName: loc.display_name,
            address: loc.address,
          },
        })
      );
    }, 100);
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

  const handleOpenAdmin = () => {
    setShowAdminPortal(true);
    if (onAdminToggle) onAdminToggle(true);
  };

  const handleCloseAdmin = () => {
    setShowAdminPortal(false);
    if (onAdminToggle) onAdminToggle(false);
  };

  return (
    <>
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100"
      >
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between gap-2.5">
          {/* Top Bar for GiGs: Integrated Address / Street / Location Search Bar */}
          {activeTab === 'gigs' ? (
            <div
              ref={searchContainerRef}
              className="relative flex-1 flex items-center"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="w-full relative flex items-center"
              >
                <div className="relative w-full flex items-center bg-neutral-100/90 hover:bg-neutral-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-neutral-200/80 rounded-2xl transition-all shadow-2xs">
                  <Search className="w-4 h-4 text-neutral-400 ml-3 shrink-0" />
                  <input
                    id="top-bar-location-search"
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchResults.length > 0 || searchQuery.length >= 2) {
                        setIsDropdownOpen(true);
                      }
                    }}
                    placeholder="Search home no., street, location, province..."
                    className="w-full bg-transparent text-xs py-2 px-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                    autoComplete="off"
                  />

                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 text-neutral-400 mr-3 animate-spin shrink-0" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="p-1 mr-2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </form>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-neutral-200 shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
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

                          const primaryText = [house, road].filter(Boolean).join(' ') || loc.display_name.split(',')[0];
                          const secondaryText = [city, province, country].filter(Boolean).join(', ') || loc.display_name;

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
            </div>
          ) : (
            /* Standard Header for Seekers & Profile */
            <div className="flex items-center gap-2.5">
              {profilePic && activeTab !== 'profile' && (
                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange('profile')}
                  title="View Profile"
                  className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200 hover:ring-2 hover:ring-neutral-900 transition-all cursor-pointer shrink-0"
                >
                  <img
                    src={profilePic}
                    alt={userProfile?.fullName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isApproved && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-white" />
                  )}
                </button>
              )}

              <div>
                <h1
                  id="header-title"
                  className="text-lg font-bold tracking-tight text-neutral-900 select-none flex items-center gap-1.5"
                >
                  <span>{currentTitle}</span>
                  {activeTab === 'profile' && isApproved && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </h1>
              </div>
            </div>
          )}

          {/* Right Action: Admin Feature Launch Icon */}
          <div className="flex items-center min-w-8 justify-end shrink-0">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <RealisticAdminIcon onClick={handleOpenAdmin} />
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Full Screen Admin Feature Console */}
      <AnimatePresence>
        {showAdminPortal && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <AdminPortal
              onClose={handleCloseAdmin}
              onProfileReviewed={() => {
                if (onProfileReviewed) onProfileReviewed();
                window.dispatchEvent(new Event('app-profile-updated'));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
