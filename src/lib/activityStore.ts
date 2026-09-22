import { UserActivity, HireProposal, SubmissionRecord, ProfileData } from '../types';
import { getStoredSubmissions } from './submissionStore';

const ACTIVITIES_KEY = 'app_user_activities';
const HIRE_PROPOSALS_KEY = 'app_hire_proposals';
const AVAILABILITY_KEY = 'app_seeker_availability';
const USER_PROFILE_KEY = 'app_user_profile';

// --- Persistent User Activities ---
export function getActivities(): UserActivity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function recordActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): UserActivity {
  const current = getActivities();
  const newActivity: UserActivity = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  const updated = [newActivity, ...current].slice(0, 50); // Keep last 50 activities
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('app-activity-updated'));
  } catch {
    // ignore
  }
  return newActivity;
}

// --- Persistent Hire Proposals ---
export function getHireProposals(): HireProposal[] {
  try {
    const raw = localStorage.getItem(HIRE_PROPOSALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function createHireProposal(data: Omit<HireProposal, 'id' | 'createdAt' | 'status'>): HireProposal {
  const current = getHireProposals();
  const proposal: HireProposal = {
    ...data,
    id: `hire-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updated = [proposal, ...current];
  try {
    localStorage.setItem(HIRE_PROPOSALS_KEY, JSON.stringify(updated));
    recordActivity({
      type: 'hire_sent',
      title: `Hire Proposal sent to ${data.seekerName}`,
      description: `Offered "${data.gigTitle}" for ${data.budget}`,
    });
    window.dispatchEvent(new Event('app-hires-updated'));
  } catch {
    // ignore
  }
  return proposal;
}

// --- Seeker Availability for Hire Toggle ---
export function getUserAvailability(): boolean {
  try {
    const raw = localStorage.getItem(AVAILABILITY_KEY);
    if (raw !== null) {
      return JSON.parse(raw) === true;
    }
    // Default to true if user is approved
    const rawProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (rawProfile) {
      const p = JSON.parse(rawProfile);
      return p.status === 'approved';
    }
  } catch {
    // fallback
  }
  return false;
}

export function setUserAvailability(isAvailable: boolean): boolean {
  try {
    localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(isAvailable));

    // Also sync with user profile record
    const rawProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (rawProfile) {
      const p = JSON.parse(rawProfile);
      p.isAvailableForHire = isAvailable;
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(p));
    }

    recordActivity({
      type: 'availability_toggle',
      title: isAvailable ? 'Turned on "Available for Hire"' : 'Turned off "Available for Hire"',
      description: isAvailable
        ? 'Your profile is now visible in the Seekers feature for others to hire.'
        : 'Your profile is hidden from the Seekers directory.',
    });

    window.dispatchEvent(new Event('app-availability-updated'));
    window.dispatchEvent(new Event('app-profile-updated'));
  } catch {
    // ignore
  }
  return isAvailable;
}

// --- Retrieve ONLY Real Registered & Approved Users for Seekers Feature ---
export function getApprovedSeekers(): SubmissionRecord[] {
  const storeSubmissions = getStoredSubmissions();
  const combinedMap = new Map<string, SubmissionRecord>();

  // 1. Only real approved submissions from store
  storeSubmissions.forEach((sub) => {
    if (
      sub.status === 'approved' &&
      !sub.id?.startsWith('approved-seeker-') &&
      !sub.id?.startsWith('sub-00')
    ) {
      combinedMap.set(sub.id, {
        ...sub,
        hourlyRate: sub.hourlyRate || '$50/hr',
        rating: sub.rating || 5.0,
        completedGigs: sub.completedGigs || 1,
      });
    }
  });

  // 2. Real Current user profile if approved and has available for hire active
  try {
    const rawProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (rawProfile) {
      const userProfile: ProfileData = JSON.parse(rawProfile);
      const isAvailable = getUserAvailability();

      if (userProfile.status === 'approved' && isAvailable && userProfile.fullName) {
        const currentUserRecord: SubmissionRecord = {
          ...userProfile,
          id: userProfile.id || 'current-user-seeker',
          isCurrentUser: true,
          isAvailableForHire: true,
          hourlyRate: userProfile.hourlyRate || '$50/hr',
          rating: 5.0,
          completedGigs: 1,
          submittedAt: userProfile.submittedAt || new Date().toISOString(),
        };
        combinedMap.set('current-user-seeker', currentUserRecord);
      }
    }
  } catch {
    // ignore
  }

  return Array.from(combinedMap.values());
}
