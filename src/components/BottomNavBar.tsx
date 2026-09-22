import React from 'react';
import { motion } from 'motion/react';
import { TabType } from '../types';
import {
  RealisticSeekersIcon,
  RealisticGigsIcon,
  RealisticProfileIcon,
} from './RealisticIcons';
import { useUserProfile } from '../lib/useUserProfile';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string; isActive?: boolean }>;
}

const NAV_ITEMS: NavConfig[] = [
  { id: 'seekers', label: 'Seekers', icon: RealisticSeekersIcon },
  { id: 'gigs', label: 'GiGs', icon: RealisticGigsIcon },
  { id: 'profile', label: 'Profile', icon: RealisticProfileIcon },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const userProfile = useUserProfile();
  const profilePicture = userProfile?.profilePicture;
  const isApproved = userProfile?.status === 'approved';

  return (
    <nav
      id="bottom-menu-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isProfileTab = item.id === 'profile';

          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-all duration-200 select-none ${
                isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <div className="relative flex items-center justify-center w-7 h-7 mb-0.5">
                {isProfileTab && profilePicture ? (
                  <div
                    className={`relative w-6.5 h-6.5 rounded-full overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'ring-2 ring-neutral-900 ring-offset-1 scale-105 shadow-sm'
                        : 'border border-neutral-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={profilePicture}
                      alt="User Profile"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isApproved && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white" />
                    )}
                  </div>
                ) : (
                  <Icon className="w-6 h-6" isActive={isActive} />
                )}
              </div>

              <span
                className={`text-xs tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'font-semibold text-neutral-900 scale-105'
                    : 'font-normal text-neutral-400'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neutral-900 shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
