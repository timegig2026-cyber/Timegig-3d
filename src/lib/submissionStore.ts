import { SubmissionRecord, ProfileData } from '../types';

const STORAGE_KEY = 'app_admin_submissions';
const USER_PROFILE_KEY = 'app_user_profile';

export const getStoredSubmissions = (): SubmissionRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        // Filter out any leftover mock user seeds if previously saved
        const realSubmissions = list.filter(
          (s) => s.isCurrentUser || (!s.id?.startsWith('sub-00') && s.id !== 'sub-001' && s.id !== 'sub-002' && s.id !== 'sub-003')
        );
        return realSubmissions;
      }
    }
  } catch {
    // fallback
  }
  return [];
};

export const saveSubmissions = (submissions: SubmissionRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch {
    // ignore
  }
};

export const submitUserProfile = (profile: ProfileData): SubmissionRecord => {
  const currentList = getStoredSubmissions();
  const existingIdx = currentList.findIndex((s) => s.isCurrentUser || (profile.email && s.email === profile.email));

  const newSubmission: SubmissionRecord = {
    ...profile,
    id: profile.id || `user-sub-${Date.now()}`,
    status: 'in_review',
    submittedAt: profile.submittedAt || new Date().toISOString(),
    isCurrentUser: true,
  };

  let updatedList: SubmissionRecord[];
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = newSubmission;
  } else {
    updatedList = [newSubmission, ...currentList];
  }

  saveSubmissions(updatedList);
  return newSubmission;
};

export const approveSubmission = (id: string): SubmissionRecord | null => {
  const currentList = getStoredSubmissions();
  const idx = currentList.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const updatedItem: SubmissionRecord = {
    ...currentList[idx],
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    rejectionReason: undefined,
  };

  currentList[idx] = updatedItem;
  saveSubmissions(currentList);

  // If this is the current user profile, also update user profile state in localStorage
  if (updatedItem.isCurrentUser) {
    try {
      const rawUser = localStorage.getItem(USER_PROFILE_KEY);
      if (rawUser) {
        const userObj = JSON.parse(rawUser);
        userObj.status = 'approved';
        userObj.reviewedAt = updatedItem.reviewedAt;
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userObj));
      }
    } catch {
      // ignore
    }
  }

  return updatedItem;
};

export const rejectSubmission = (id: string, reason: string): SubmissionRecord | null => {
  const currentList = getStoredSubmissions();
  const idx = currentList.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const updatedItem: SubmissionRecord = {
    ...currentList[idx],
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    rejectionReason: reason || 'Document or facial photograph does not meet verification requirements.',
  };

  currentList[idx] = updatedItem;
  saveSubmissions(currentList);

  // If this is the current user profile, also update user profile state in localStorage
  if (updatedItem.isCurrentUser) {
    try {
      const rawUser = localStorage.getItem(USER_PROFILE_KEY);
      if (rawUser) {
        const userObj = JSON.parse(rawUser);
        userObj.status = 'rejected';
        userObj.rejectionReason = updatedItem.rejectionReason;
        userObj.reviewedAt = updatedItem.reviewedAt;
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userObj));
      }
    } catch {
      // ignore
    }
  }

  return updatedItem;
};
