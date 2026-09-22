export type TabType = 'seekers' | 'gigs' | 'profile';

export interface TabItem {
  id: TabType;
  label: string;
  iconName: 'Users' | 'Briefcase' | 'User';
  badge?: string | number;
}

export type ProfileStep =
  | 'intro'
  | 'basic-info'
  | 'profile-picture'
  | 'face-only'
  | 'id-document'
  | 'review-submit'
  | 'in-review'
  | 'approved'
  | 'rejected';

export type ProfileStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

export interface ProfileData {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  location: string;
  bio: string;
  profilePicture: string | null;
  faceOnlyPicture: string | null;
  idDocumentType: 'passport' | 'drivers_license' | 'national_id';
  idDocumentFront: string | null;
  idDocumentFrontName?: string;
  idDocumentBack?: string | null;
  idDocumentBackName?: string;
  status: ProfileStatus;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  estimatedReviewMinutes: string;
}

export type AdminFeatureTab = 'submissions' | 'seekers' | 'gigs' | 'tenant' | 'system';

export interface SubmissionRecord extends ProfileData {
  id: string;
  submittedAt: string;
  isCurrentUser?: boolean;
}

export interface GeocodeLocation {
  place_id: string | number;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    province?: string;
    postcode?: string;
    country?: string;
  };
}
