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
  hourlyRate?: string;
  isAvailableForHire?: boolean;
  lat?: number;
  lng?: number;
}

export type AdminFeatureTab = 'submissions' | 'seekers' | 'gigs' | 'tenant' | 'system';

export interface SubmissionRecord extends ProfileData {
  id: string;
  submittedAt: string;
  isCurrentUser?: boolean;
  rating?: number;
  completedGigs?: number;
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

export interface HireProposal {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerOccupation: string;
  seekerAvatar?: string | null;
  clientName: string;
  clientEmail?: string;
  gigTitle: string;
  budget: string;
  message: string;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: string;
}

export interface UserActivity {
  id: string;
  type:
    | 'hire_sent'
    | 'profile_update'
    | 'availability_toggle'
    | 'verification_status'
    | 'gig_created'
    | 'gig_applied'
    | 'tenant_action';
  title: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export type GigCategory =
  | 'dog_walking'
  | 'cleaning'
  | 'nanny'
  | 'roof_fixing'
  | 'mechanical'
  | 'computer_repair'
  | 'construction'
  | 'security'
  | 'gardening'
  | 'moving'
  | 'electrical'
  | 'general';

export interface MapGig {
  id: string;
  title: string;
  category: GigCategory;
  categoryLabel: string;
  description: string;
  pay: string;
  timeframe: string;
  lat: number;
  lng: number;
  locationName: string;
  posterName: string;
  posterPhone?: string;
  posterAvatar?: string | null;
  createdAt: string;
  applicationsCount?: number;
  status: 'open' | 'assigned' | 'completed';
}

export interface GigApplication {
  id: string;
  gigId: string;
  applicantName: string;
  applicantAvatar?: string | null;
  applicantPhone?: string;
  proposal: string;
  expectedPay?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface TenantActivation {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  occupation: string;
  location: string;
  profilePicture: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface TenantProperty {
  id: string;
  unitTitle: string;
  address: string;
  rentAmount: string;
  leaseStatus: 'active' | 'pending' | 'inspection_scheduled';
  landlordName: string;
  landlordContact: string;
  nextPaymentDate: string;
  maintenanceRequestsCount: number;
}
