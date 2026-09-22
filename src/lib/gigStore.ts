import { MapGig, GigApplication, GigCategory } from '../types';
import { recordActivity } from './activityStore';

const MAP_GIGS_KEY = 'app_map_gigs_records';
const GIG_APPLICATIONS_KEY = 'app_gig_applications';

export const GIG_CATEGORIES_METADATA: Record<
  GigCategory,
  { label: string; icon: string; bg: string; color: string }
> = {
  dog_walking: {
    label: 'Dog Walking',
    icon: '🐕',
    bg: 'bg-amber-100',
    color: 'text-amber-800',
  },
  cleaning: {
    label: 'Cleaning',
    icon: '🧹',
    bg: 'bg-teal-100',
    color: 'text-teal-800',
  },
  nanny: {
    label: 'Nanny / Babysitting',
    icon: '👶',
    bg: 'bg-pink-100',
    color: 'text-pink-800',
  },
  roof_fixing: {
    label: 'Roof Fixing & Repairs',
    icon: '🏠',
    bg: 'bg-orange-100',
    color: 'text-orange-800',
  },
  mechanical: {
    label: 'Mechanical Assistant',
    icon: '🔧',
    bg: 'bg-blue-100',
    color: 'text-blue-800',
  },
  computer_repair: {
    label: 'Computer Repair & IT',
    icon: '💻',
    bg: 'bg-indigo-100',
    color: 'text-indigo-800',
  },
  construction: {
    label: 'Construction & Handyman',
    icon: '🔨',
    bg: 'bg-yellow-100',
    color: 'text-yellow-800',
  },
  security: {
    label: 'Security & Patrol',
    icon: '🛡️',
    bg: 'bg-slate-100',
    color: 'text-slate-800',
  },
  gardening: {
    label: 'Gardening & Yard',
    icon: '🌿',
    bg: 'bg-emerald-100',
    color: 'text-emerald-800',
  },
  moving: {
    label: 'Moving & Heavy Lifting',
    icon: '📦',
    bg: 'bg-purple-100',
    color: 'text-purple-800',
  },
  electrical: {
    label: 'Electrical & Solar',
    icon: '⚡',
    bg: 'bg-amber-100',
    color: 'text-amber-800',
  },
  general: {
    label: 'Casual Assistance',
    icon: '✨',
    bg: 'bg-neutral-100',
    color: 'text-neutral-800',
  },
};

/**
 * Returns only real gigs created by users on the app.
 * All mock/seed gigs are filtered out.
 */
export function getStoredMapGigs(): MapGig[] {
  try {
    const raw = localStorage.getItem(MAP_GIGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any mock/seed gigs so only real user gigs exist
        const realGigs = parsed.filter((g: MapGig) => !g.id.startsWith('gig-seed-'));
        return realGigs;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveMapGig(
  gigData: Omit<MapGig, 'id' | 'createdAt' | 'status' | 'applicationsCount'>
): MapGig {
  const current = getStoredMapGigs();
  const categoryMeta =
    GIG_CATEGORIES_METADATA[gigData.category] || GIG_CATEGORIES_METADATA.general;

  const newGig: MapGig = {
    ...gigData,
    id: `gig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    categoryLabel: categoryMeta.label,
    createdAt: new Date().toISOString(),
    status: 'open',
    applicationsCount: 0,
  };

  const updated = [newGig, ...current];
  try {
    localStorage.setItem(MAP_GIGS_KEY, JSON.stringify(updated));
    recordActivity({
      type: 'gig_created',
      title: `Created Map GiG: "${newGig.title}"`,
      description: `Posted at ${newGig.locationName} (R${newGig.pay.replace('$', '')})`,
      meta: { gigId: newGig.id, lat: newGig.lat, lng: newGig.lng },
    });
    window.dispatchEvent(new Event('app-gigs-updated'));
  } catch {
    // ignore
  }
  return newGig;
}

export function getGigApplications(): GigApplication[] {
  try {
    const raw = localStorage.getItem(GIG_APPLICATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function applyToMapGig(
  applicationData: Omit<GigApplication, 'id' | 'createdAt' | 'status'>,
  gigTitle: string
 ): GigApplication {
   const current = getGigApplications();
   const newApp: GigApplication = {
     ...applicationData,
     id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
     status: 'pending',
     createdAt: new Date().toISOString(),
   };
 
   const updated = [newApp, ...current];
   try {
     localStorage.setItem(GIG_APPLICATIONS_KEY, JSON.stringify(updated));
 
     // Update application count on the gig
     const gigs = getStoredMapGigs();
     const targetGig = gigs.find((g) => g.id === applicationData.gigId);
     if (targetGig) {
       targetGig.applicationsCount = (targetGig.applicationsCount || 0) + 1;
       localStorage.setItem(MAP_GIGS_KEY, JSON.stringify(gigs));
     }
 
     recordActivity({
       type: 'gig_applied',
       title: `Applied to GiG: "${gigTitle}"`,
       description: `Submitted proposal: "${applicationData.proposal.substring(0, 60)}..."`,
       meta: { gigId: applicationData.gigId, applicationId: newApp.id },
     });
 
     window.dispatchEvent(new Event('app-gigs-updated'));
     window.dispatchEvent(new Event('app-activity-updated'));
   } catch {
     // ignore
   }
   return newApp;
 }

 export function acceptGigApplication(applicationId: string): GigApplication | null {
   const apps = getGigApplications();
   const target = apps.find(a => a.id === applicationId);
   if (!target) return null;

   target.status = 'accepted';
   try {
     localStorage.setItem(GIG_APPLICATIONS_KEY, JSON.stringify(apps));
     
     // Update gig status
     const gigs = getStoredMapGigs();
     const gig = gigs.find(g => g.id === target.gigId);
     if (gig) {
       gig.status = 'assigned';
       localStorage.setItem(MAP_GIGS_KEY, JSON.stringify(gigs));
     }

     window.dispatchEvent(new Event('app-gigs-updated'));
     window.dispatchEvent(new Event('app-activity-updated'));
     // Custom event for real-time simulation
     window.dispatchEvent(new CustomEvent('app-gig-accepted', { detail: target }));
     return target;
   } catch {
     return null;
   }
 }
