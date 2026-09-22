import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { RealisticAdminIcon } from './RealisticIcons';
import { AdminPortal } from './admin/AdminPortal';
import { SeekerAvailabilityModal } from './seekers/SeekerAvailabilityModal';
import { TenantFullScreenView } from './profile/TenantFullScreenView';
import { motion, AnimatePresence } from 'motion/react';
import { useUserProfile } from '../lib/useUserProfile';
import { getUserAvailability } from '../lib/activityStore';
import {
  ShieldCheck,
  UserCheck,
  Building2,
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
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [isAvailableForHire, setIsAvailableForHire] = useState(false);

  const currentTitle = TAB_TITLES[activeTab];
  const userProfile = useUserProfile();
  const profilePic = userProfile?.profilePicture;
  const isApproved = userProfile?.status === 'approved';

  // Load availability
  useEffect(() => {
    const updateAvailability = () => {
      setIsAvailableForHire(getUserAvailability());
    };
    updateAvailability();
    window.addEventListener('app-availability-updated', updateAvailability);
    window.addEventListener('app-profile-updated', updateAvailability);
    return () => {
      window.removeEventListener('app-availability-updated', updateAvailability);
      window.removeEventListener('app-profile-updated', updateAvailability);
    };
  }, []);

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
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 h-16 transition-all duration-200"
      >
        <div className="max-w-md mx-auto px-4 h-full flex items-center justify-between gap-2.5">
          {/* Header Title & User Avatar */}
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

          {/* Right Action Icons */}
          <div className="flex items-center min-w-8 justify-end shrink-0 gap-2">
            {/* Seekers Top Bar Action: "Appear in Seekers / Get Hired" Icon */}
            {activeTab === 'seekers' && (
              <button
                id="btn-seekers-top-appear"
                type="button"
                onClick={() => setShowAvailabilityModal(true)}
                title="Appear in Seekers feature to get hired"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isAvailableForHire
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <div className="relative">
                  <UserCheck
                    className={`w-4 h-4 ${
                      isAvailableForHire ? 'text-emerald-600' : 'text-neutral-500'
                    }`}
                  />
                  {isAvailableForHire && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-1 ring-white animate-pulse" />
                  )}
                </div>
                <span className="hidden sm:inline text-[11px]">
                  {isAvailableForHire ? 'Available for Hire' : 'Get Hired'}
                </span>
              </button>
            )}

            {/* Profile Tab Actions: Tenant Feature & Admin Console Launch */}
            {activeTab === 'profile' && (
              <div className="flex items-center gap-2">
                {/* Tenant Feature in Top Bar Corner */}
                <button
                  id="btn-profile-top-tenant"
                  type="button"
                  onClick={() => setShowTenantModal(true)}
                  title="Tenant Portal & Lease Management"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 rounded-2xl text-neutral-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
                >
                  <Building2 className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="text-[11px]">Tenant</span>
                </button>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <RealisticAdminIcon onClick={handleOpenAdmin} />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Full Screen Tenant Feature View */}
      <AnimatePresence>
        {showTenantModal && (
          <TenantFullScreenView
            onClose={() => setShowTenantModal(false)}
            onNavigateToProfile={() => onTabChange && onTabChange('profile')}
          />
        )}
      </AnimatePresence>

      {/* Seeker Availability Modal ("Appear in Seekers") */}
      <AnimatePresence>
        {showAvailabilityModal && (
          <SeekerAvailabilityModal
            onClose={() => setShowAvailabilityModal(false)}
            onNavigateTab={onTabChange}
          />
        )}
      </AnimatePresence>

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
                window.dispatchEvent(new Event('app-availability-updated'));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
