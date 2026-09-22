/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType } from './types';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { SeekersView } from './components/SeekersView';
import { GigsView } from './components/GigsView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('seekers');
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleProfileReviewed = () => {
    setProfileRefreshKey((prev) => prev + 1);
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-neutral-100 selection:text-neutral-900 font-sans"
    >
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen relative shadow-xs border-x border-neutral-100/80">
        {/* Minimalist Top Bar (Shown for Profile tab; removed for Seekers & GiGs where search bar floats directly on map) */}
        {activeTab === 'profile' && (
          <Header
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onProfileReviewed={handleProfileReviewed}
            onAdminToggle={setIsAdminOpen}
          />
        )}

        {/* Dynamic Feature Views */}
        <main id="main-content-area" className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'seekers' && (
              <motion.div
                key="seekers"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col"
              >
                <SeekersView />
              </motion.div>
            )}

            {activeTab === 'gigs' && (
              <motion.div
                key="gigs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col h-full"
              >
                <GigsView />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key={`profile-${profileRefreshKey}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col"
              >
                <ProfileView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Menu Bar with 3 Features: Seekers, GiGs, Profile (Hidden when admin view/review is open) */}
        {!isAdminOpen && (
          <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>
    </div>
  );
}
