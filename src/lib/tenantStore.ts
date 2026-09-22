import { TenantActivation, TenantReferredUser } from '../types';
import { recordActivity } from './activityStore';

const TENANT_ACTIVATIONS_KEY = 'app_tenant_activations';
const TENANT_REFERRED_USERS_KEY = 'app_tenant_referred_users';

const INITIAL_REFERRED_USERS: TenantReferredUser[] = [
  {
    id: 'ref-u-101',
    fullName: 'Siyabonga Khumalo',
    email: 'siya.k@gmail.com',
    phone: '+27 82 443 1920',
    joinedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    userType: 'Seeker',
    location: 'Johannesburg, South Africa',
    monthlyIncomeGenerated: 'R150,00',
    notes: 'Joined via tenant invitation link. Active daily gig bidder.',
  },
  {
    id: 'ref-u-102',
    fullName: 'Anelisa Dlamini',
    email: 'anelisa.d@yahoo.com',
    phone: '+27 71 882 0019',
    joinedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    userType: 'Gig Poster',
    location: 'Soweto, Gauteng',
    monthlyIncomeGenerated: 'R350,00',
    notes: 'Posts weekly handyman and painting gigs.',
  },
  {
    id: 'ref-u-103',
    fullName: 'Lethabo Mokoena',
    email: 'lethabo.mok@gmail.com',
    phone: '+27 63 112 4059',
    joinedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    userType: 'Sub-Tenant',
    location: 'Pretoria, Gauteng',
    monthlyIncomeGenerated: 'R450,00',
    notes: 'Sub-tenant managed under property portfolio.',
  },
  {
    id: 'ref-u-104',
    fullName: 'Thabo Ndlovu',
    email: 'thabo.ndlovu@outlook.com',
    phone: '+27 84 990 1234',
    joinedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    status: 'suspended',
    userType: 'Seeker',
    location: 'Sandton, Johannesburg',
    monthlyIncomeGenerated: 'R0,00',
    notes: 'Account suspended by tenant due to incomplete verification.',
  },
];

export function getTenantActivations(): TenantActivation[] {
  try {
    const raw = localStorage.getItem(TENANT_ACTIVATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function getCurrentUserTenantActivation(): TenantActivation | null {
  const list = getTenantActivations();
  // Get the most recent activation for current user
  return list[0] || null;
}

export function requestTenantActivation(
  data: Omit<TenantActivation, 'id' | 'status' | 'requestedAt'>
): TenantActivation {
  const current = getTenantActivations();
  const inviteCode = `TENANT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://timegig.app';
  const inviteUrl = `${origin}/?ref=${inviteCode}`;

  const newActivation: TenantActivation = {
    ...data,
    id: `tenant-act-${Date.now()}`,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    inviteCode,
    inviteUrl,
    invitedUsersCount: 0,
    monthlyPassiveEarnings: 'R0,00',
    subscriptionPaid: false,
  };

  const updated = [newActivation, ...current.filter((a) => a.email !== data.email)];
  try {
    localStorage.setItem(TENANT_ACTIVATIONS_KEY, JSON.stringify(updated));
    recordActivity({
      type: 'tenant_action',
      title: 'Tenant Feature Activation Requested',
      description: `Sent activation request for ${data.fullName} to Admin`,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return newActivation;
}

export function recordTenantSubscriptionPayment(
  proofReference: string = 'Sub299'
): TenantActivation | null {
  const list = getTenantActivations();
  const target = list[0];
  if (!target) return null;

  target.subscriptionPaid = true;
  target.subscriptionPaidAt = new Date().toISOString();
  target.subscriptionReference = proofReference;
  target.subscriptionVerificationStatus = 'verified';

  try {
    localStorage.setItem(TENANT_ACTIVATIONS_KEY, JSON.stringify(list));
    recordActivity({
      type: 'tenant_action',
      title: 'Tenant Monthly Subscription Paid (R299,99)',
      description: `Capitec Payment completed to Matthews (Acc: 1334067366) Ref: ${proofReference}`,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return target;
}

export function submitTenantProofOfPayment(
  fileData: string,
  fileName: string,
  reference: string = 'Sub299'
): TenantActivation | null {
  const list = getTenantActivations();
  const target = list[0];
  if (!target) return null;

  target.proofOfPaymentFile = fileData;
  target.proofOfPaymentFileName = fileName;
  target.proofOfPaymentSubmittedAt = new Date().toISOString();
  target.subscriptionReference = reference;
  target.subscriptionVerificationStatus = 'in_review';
  target.subscriptionPaid = true;

  try {
    localStorage.setItem(TENANT_ACTIVATIONS_KEY, JSON.stringify(list));
    recordActivity({
      type: 'tenant_action',
      title: 'Proof of Payment Document Uploaded (R299,99)',
      description: `Uploaded document ${fileName} for Capitec Account Matthews (Ref: ${reference}). Review in 15-25 min.`,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return target;
}

export function approveTenantActivation(id: string): TenantActivation | null {
  const list = getTenantActivations();
  const target = list.find((a) => a.id === id);
  if (!target) return null;

  target.status = 'approved';
  target.reviewedAt = new Date().toISOString();

  try {
    localStorage.setItem(TENANT_ACTIVATIONS_KEY, JSON.stringify(list));
    recordActivity({
      type: 'tenant_action',
      title: `Tenant Approved: ${target.fullName}`,
      description: 'Admin approved tenant feature activation with profile logo attached',
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return target;
}

export function rejectTenantActivation(id: string, reason?: string): TenantActivation | null {
  const list = getTenantActivations();
  const target = list.find((a) => a.id === id);
  if (!target) return null;

  target.status = 'rejected';
  target.reviewedAt = new Date().toISOString();
  target.rejectionReason = reason || 'Admin review did not meet verification criteria';

  try {
    localStorage.setItem(TENANT_ACTIVATIONS_KEY, JSON.stringify(list));
    recordActivity({
      type: 'tenant_action',
      title: `Tenant Request Rejected: ${target.fullName}`,
      description: target.rejectionReason,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return target;
}

export function verifyTenantProofOfPayment(id: string): TenantActivation | null {
  const list = getTenantActivations();
  const target = list.find((a) => a.id === id);
  if (!target) return null;

  target.subscriptionVerificationStatus = 'verified';
  target.subscriptionPaid = true;

  try {
    localStorage.setItem(TENANT_ACTIVATIONS_KEY, JSON.stringify(list));
    recordActivity({
      type: 'tenant_action',
      title: `Proof of Payment Verified for ${target.fullName}`,
      description: `Admin verified R299,99 subscription payment to Matthews Capitec Account (Ref: ${target.subscriptionReference || 'Sub299'})`,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return target;
}

export function rejectTenantProofOfPayment(id: string, reason?: string): TenantActivation | null {
  const list = getTenantActivations();
  const target = list.find((a) => a.id === id);
  if (!target) return null;

  target.subscriptionVerificationStatus = 'none';
  target.subscriptionPaid = false;

  try {
    localStorage.setItem(TENANT_ACTIVATIONS_KEY, JSON.stringify(list));
    recordActivity({
      type: 'tenant_action',
      title: `Proof of Payment Rejected for ${target.fullName}`,
      description: reason || 'Invalid or unverified proof of payment document.',
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return target;
}

export function isUserTenantApproved(): boolean {
  const activation = getCurrentUserTenantActivation();
  return activation?.status === 'approved';
}

export function getTenantReferredUsers(): TenantReferredUser[] {
  try {
    const raw = localStorage.getItem(TENANT_REFERRED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Seed default if empty
    localStorage.setItem(TENANT_REFERRED_USERS_KEY, JSON.stringify(INITIAL_REFERRED_USERS));
    return INITIAL_REFERRED_USERS;
  } catch {
    return INITIAL_REFERRED_USERS;
  }
}

export function addTenantReferredUser(
  user: Omit<TenantReferredUser, 'id' | 'joinedAt'>
): TenantReferredUser {
  const list = getTenantReferredUsers();
  const newUser: TenantReferredUser = {
    ...user,
    id: `ref-u-${Date.now()}`,
    joinedAt: new Date().toISOString(),
  };

  const updated = [newUser, ...list];
  try {
    localStorage.setItem(TENANT_REFERRED_USERS_KEY, JSON.stringify(updated));
    recordActivity({
      type: 'tenant_action',
      title: `Added Referred User: ${user.fullName}`,
      description: `Tenant registered ${user.fullName} (${user.userType}) under referral network`,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return newUser;
}

export function updateTenantReferredUserStatus(
  id: string,
  newStatus: 'active' | 'suspended' | 'pending'
): TenantReferredUser | null {
  const list = getTenantReferredUsers();
  const target = list.find((u) => u.id === id);
  if (!target) return null;

  target.status = newStatus;
  try {
    localStorage.setItem(TENANT_REFERRED_USERS_KEY, JSON.stringify(list));
    recordActivity({
      type: 'tenant_action',
      title: `Updated Status for ${target.fullName}`,
      description: `Tenant changed user status to ${newStatus}`,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
  } catch {
    // ignore
  }

  return target;
}

export function deleteTenantReferredUser(id: string): boolean {
  const list = getTenantReferredUsers();
  const filtered = list.filter((u) => u.id !== id);
  try {
    localStorage.setItem(TENANT_REFERRED_USERS_KEY, JSON.stringify(filtered));
    recordActivity({
      type: 'tenant_action',
      title: `Removed Referred User`,
      description: `Tenant removed user from referral network`,
    });
    window.dispatchEvent(new Event('app-tenant-updated'));
    return true;
  } catch {
    return false;
  }
}
