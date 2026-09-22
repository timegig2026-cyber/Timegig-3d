import React from 'react';
import { useUserProfile } from '../../lib/useUserProfile';
import { getUserAvailability, setUserAvailability } from '../../lib/activityStore';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { TabType } from '../../types';

interface SeekerAvailabilityModalProps {
  onClose: () => void;
  onNavigateTab?: (tab: TabType) => void;
}

export const SeekerAvailabilityModal: React.FC<SeekerAvailabilityModalProps> = ({
  onClose,
  onNavigateTab,
}) => {
  const userProfile = useUserProfile();
  const isApproved = userProfile?.status === 'approved';
  const isAvailable = getUserAvailability();

  const handleToggleAvailability = () => {
    setUserAvailability(!isAvailable);
  };

  const handleGoToProfile = () => {
    onClose();
    if (onNavigateTab) {
      onNavigateTab('profile');
    }
  };

  return (
    <div
      id="seeker-availability-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Appear in Seekers
              </h3>
              <p className="text-[11px] text-neutral-500">
                Get discovered & hired for gigs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status Hero Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isApproved && isAvailable
                ? 'bg-emerald-50/80 border-emerald-200'
                : isApproved
                ? 'bg-neutral-50 border-neutral-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isApproved && isAvailable
                      ? 'bg-emerald-600 text-white'
                      : isApproved
                      ? 'bg-neutral-200 text-neutral-600'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {isApproved && isAvailable ? (
                    <Eye className="w-5 h-5" />
                  ) : isApproved ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    {isApproved && isAvailable
                      ? 'You are Appearing in Seekers'
                      : isApproved
                      ? 'Currently Hidden from Seekers'
                      : 'Verification Required'}
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    {isApproved && isAvailable
                      ? 'Clients across the network can see your profile & hire you'
                      : isApproved
                      ? 'Toggle switch below to start receiving gig offers'
                      : 'Complete face photograph & ID verification in Profile'}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            {isApproved && (
              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800">
                  Available for Hire Status
                </span>
                <button
                  type="button"
                  onClick={handleToggleAvailability}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAvailable ? 'bg-emerald-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* User Preview */}
          {userProfile && (
            <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
              <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Your Seeker Profile Card Preview
              </h5>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center shrink-0">
                  {userProfile.profilePicture ? (
                    <img
                      src={userProfile.profilePicture}
                      alt={userProfile.fullName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-neutral-500">
                      {userProfile.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {userProfile.fullName || 'Complete your name'}
                    </p>
                    {isApproved && (
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {userProfile.occupation || 'Set your profession in Profile'}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {userProfile.location || 'Location not set'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          {!isApproved ? (
            <button
              type="button"
              onClick={handleGoToProfile}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Go to Profile & Complete Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
