import { useState, useEffect } from 'react';
import { ProfileData } from '../types';

export const USER_PROFILE_STORAGE_KEY = 'app_user_profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(() => {
    try {
      const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (saved) setProfile(JSON.parse(saved));
        else setProfile(null);
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorage);
    // Custom event to update in-tab immediately
    window.addEventListener('app-profile-updated', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('app-profile-updated', handleStorage);
    };
  }, []);

  return profile;
}
