import React, { useState, useEffect } from 'react';
import { MapGig, GigCategory } from '../../types';
import { GIG_CATEGORIES_METADATA, saveMapGig } from '../../lib/gigStore';
import { reverseGeocode } from '../../lib/geocoding';
import { useUserProfile } from '../../lib/useUserProfile';
import {
  MapPin,
  X,
  Sparkles,
  Clock,
  Briefcase,
  CheckCircle2,
  Loader2,
  Navigation,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateMapGigModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onGigCreated: (gig: MapGig) => void;
}

const CATEGORY_PRESETS: {
  category: GigCategory;
  defaultTitle: string;
  defaultPay: string;
  defaultTimeframe: string;
}[] = [
  {
    category: 'dog_walking',
    defaultTitle: 'Afternoon Dog Walking & Park Play',
    defaultPay: 'R25 / walk',
    defaultTimeframe: 'Today, 4:00 PM',
  },
  {
    category: 'cleaning',
    defaultTitle: 'Apartment Deep Cleaning & Kitchen Sanitization',
    defaultPay: 'R80 flat',
    defaultTimeframe: 'This Weekend',
  },
  {
    category: 'nanny',
    defaultTitle: 'Weekend Babysitter / Nanny Assistance',
    defaultPay: 'R22 / hr',
    defaultTimeframe: 'Saturday Evening',
  },
  {
    category: 'roof_fixing',
    defaultTitle: 'Roof Gutter & Shingle Leak Repair',
    defaultPay: 'R150 flat',
    defaultTimeframe: 'Immediate / Next 2 Days',
  },
  {
    category: 'mechanical',
    defaultTitle: 'Vehicle Brake Pads & Oil Change Assistant',
    defaultPay: 'R55 / hr',
    defaultTimeframe: 'Sunday Morning',
  },
  {
    category: 'computer_repair',
    defaultTitle: 'Laptop OS Reinstall & Speed Optimization',
    defaultPay: 'R70 flat',
    defaultTimeframe: 'Flexible',
  },
  {
    category: 'construction',
    defaultTitle: 'Drywall Repair & Wooden Door Trim Handyman',
    defaultPay: 'R110 flat',
    defaultTimeframe: 'Tomorrow',
  },
  {
    category: 'security',
    defaultTitle: 'Private Event Door Security & Access Control',
    defaultPay: 'R30 / hr',
    defaultTimeframe: 'Friday Night',
  },
  {
    category: 'gardening',
    defaultTitle: 'Lawn Mowing & Hedge Trimming',
    defaultPay: 'R65 flat',
    defaultTimeframe: 'This Weekend',
  },
  {
    category: 'electrical',
    defaultTitle: 'Ceiling Fan & Light Fixture Installation',
    defaultPay: 'R75 flat',
    defaultTimeframe: 'Tomorrow Afternoon',
  },
];

export const CreateMapGigModal: React.FC<CreateMapGigModalProps> = ({
  lat,
  lng,
  onClose,
  onGigCreated,
}) => {
  const userProfile = useUserProfile();

  const [category, setCategory] = useState<GigCategory>('dog_walking');
  const [title, setTitle] = useState('Afternoon Dog Walking & Park Play');
  const [description, setDescription] = useState(
    'Need a reliable individual to walk our dog around the neighborhood park for 45 minutes. Friendly and easy to handle.'
  );
  const [pay, setPay] = useState('R25 / walk');
  const [timeframe, setTimeframe] = useState('Today, 4:00 PM');
  const [posterName, setPosterName] = useState(userProfile?.fullName || 'Local Community Member');
  const [locationName, setLocationName] = useState(`Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reverse geocode clicked coordinates
  useEffect(() => {
    let isMounted = true;
    async function fetchAddress() {
      setIsLoadingAddress(true);
      try {
        const addressName = await reverseGeocode(lat, lng);
        if (isMounted) {
          setLocationName(addressName);
          setIsLoadingAddress(false);
        }
      } catch {
        if (isMounted) {
          setLocationName(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setIsLoadingAddress(false);
        }
      }
    }
    fetchAddress();
    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  const handleSelectPreset = (cat: GigCategory) => {
    setCategory(cat);
    const preset = CATEGORY_PRESETS.find((p) => p.category === cat);
    if (preset) {
      setTitle(preset.defaultTitle);
      setPay(preset.defaultPay);
      setTimeframe(preset.defaultTimeframe);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const createdGig = saveMapGig({
      title: title.trim(),
      category,
      categoryLabel: GIG_CATEGORIES_METADATA[category]?.label || 'Casual Gig',
      description: description.trim(),
      pay: pay.trim() || 'R30 / hr',
      timeframe: timeframe.trim() || 'Flexible',
      lat,
      lng,
      locationName,
      posterName: posterName.trim() || 'Verified Member',
      posterAvatar: userProfile?.profilePicture || null,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onGigCreated(createdGig);
      onClose();
    }, 200);
  };

  return (
    <div
      id="create-gig-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Coordinates and Close */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Create GiG at this Pin</h2>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                {isLoadingAddress ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Resolving street address...
                  </span>
                ) : (
                  <span className="truncate max-w-[240px] font-medium">{locationName}</span>
                )}
              </div>
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Casual Gig Category Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Select GiG Type (Quick Presets)
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-neutral-50 rounded-2xl border border-neutral-200">
              {CATEGORY_PRESETS.map((p) => {
                const meta = GIG_CATEGORIES_METADATA[p.category];
                const isSelected = category === p.category;
                return (
                  <button
                    key={p.category}
                    type="button"
                    onClick={() => handleSelectPreset(p.category)}
                    className={`p-2 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/80'
                    }`}
                  >
                    <span className="text-sm">{meta.icon}</span>
                    <span className="text-[11px] font-semibold truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gig Title */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">GiG Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dog walking, Computer repair, Roof fix..."
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-semibold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          {/* Pay / Rate & Timeframe in 2 Columns */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1 flex items-center gap-1">
                <span className="w-3 h-3 flex items-center justify-center font-bold text-emerald-600 text-[10px]">R</span>
                <span>Pay / Budget</span>
              </label>
              <input
                type="text"
                required
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                placeholder="e.g. R25/hr or R80 flat"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Timeframe / Date</span>
              </label>
              <input
                type="text"
                required
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="e.g. Today 4 PM / Weekend"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Detailed Task Description */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Task Details & Requirements
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task, tools provided or needed, access notes..."
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Poster Name */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Posted By
            </label>
            <input
              type="text"
              value={posterName}
              onChange={(e) => setPosterName(e.target.value)}
              placeholder="Your Name / Organization"
              className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="btn-publish-map-gig"
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pinning GiG on Map...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Publish GiG on Map</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
