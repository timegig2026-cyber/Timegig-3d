import { TenantActivation } from '../types';
import { recordActivity } from './activityStore';

const TENANT_ACTIVATIONS_KEY = 'app_tenant_activations';

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
  const newActivation: TenantActivation = {
    ...data,
    id: `tenant-act-${Date.now()}`,
    status: 'pending',
    requestedAt: new Date().toISOString(),
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

export function isUserTenantApproved(): boolean {
  const activation = getCurrentUserTenantActivation();
  return activation?.status === 'approved';
}
