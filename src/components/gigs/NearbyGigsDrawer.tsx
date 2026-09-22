import React from 'react';
import { MapGig } from '../../types';
import { GIG_CATEGORIES_METADATA } from '../../lib/gigStore';
import { openNativeNavigation } from '../../lib/utils';
import {
  Compass,
  MapPin,
  Clock,
  User,
  X,
  Plus,
  ArrowRight,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { motion } from 'motion/react';

interface NearbyGigsDrawerProps {
  gigs: MapGig[];
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onSelectGig: (gig: MapGig) => void;
  onCreateGigPrompt: () => void;
}

// Calculate distance in kilometers or miles
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { distanceKm: number; text: string } {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (d < 1) {
    return { distanceKm: d, text: `${Math.round(d * 1000)}m away` };
  }
  return { distanceKm: d, text: `${d.toFixed(1)} km away` };
}

export const NearbyGigsDrawer: React.FC<NearbyGigsDrawerProps> = ({
  gigs,
  userLocation,
  onClose,
  onSelectGig,
  onCreateGigPrompt,
}) => {
  // Sort gigs by distance to user location if available
  const sortedGigs = [...gigs].map((gig) => {
    let distanceInfo = { distanceKm: 0, text: 'Location available' };
    if (userLocation) {
      distanceInfo = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        gig.lat,
        gig.lng
      );
    }
    return { ...gig, distanceInfo };
  });

  if (userLocation) {
    sortedGigs.sort((a, b) => a.distanceInfo.distanceKm - b.distanceInfo.distanceKm);
  }

  return (
    <div
      id="nearby-gigs-drawer-backdrop"
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Nearby GiGs</h3>
                <span className="px-2 py-0.2 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-bold border border-amber-400/40">
                  {sortedGigs.length} {sortedGigs.length === 1 ? 'GiG' : 'GiGs'} Real
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {userLocation ? 'Sorted by closest to your live location' : 'Real gigs posted by users'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GiGs List Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-neutral-50/50">
          {sortedGigs.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-neutral-200 p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">No Real GiGs Yet</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Be the first to create a casual or professional gig. Click anywhere on the map to pin your job!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateGigPrompt();
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create a GiG on Map</span>
              </button>
            </div>
          ) : (
            sortedGigs.map((gig) => {
              const meta =
                GIG_CATEGORIES_METADATA[gig.category] || GIG_CATEGORIES_METADATA.general;

              return (
                <div
                  key={gig.id}
                  onClick={() => onSelectGig(gig)}
                  className="p-3.5 bg-white hover:bg-neutral-50/90 border border-neutral-200/90 rounded-2xl shadow-2xs transition-all cursor-pointer group flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xl shrink-0">
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">
                            {gig.title}
                          </h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${meta.bg} ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                          {gig.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 bg-neutral-900 text-white rounded-lg text-xs font-extrabold block">
                        {gig.pay}
                      </span>
                      {userLocation && (
                        <span className="text-[10px] font-bold text-sky-600 mt-1 block">
                          {gig.distanceInfo.text}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[120px]">{gig.locationName}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{gig.timeframe}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNativeNavigation(gig.lat, gig.lng);
                        }}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Open directions in device map app"
                      >
                        <Navigation className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span>Directions</span>
                      </button>

                      <div className="flex items-center gap-1 font-semibold text-neutral-800 group-hover:translate-x-0.5 transition-transform">
                        <span>View & Apply</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-neutral-900" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-neutral-500 font-medium">
            Tap any GiG to fly to its exact location
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
