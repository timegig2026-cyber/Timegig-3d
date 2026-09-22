import React, { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from '../../lib/useUserProfile';
import {
  getTenantActivations,
  requestTenantActivation,
  getCurrentUserTenantActivation,
} from '../../lib/tenantStore';
import { TenantActivation } from '../../types';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Lock,
  ChevronRight,
  User,
  AlertCircle,
  Users,
  UserSearch,
  Briefcase,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TenantBottomNavBar, TenantTab } from './TenantBottomNavBar';

interface TenantFullScreenViewProps {
  onClose: () => void;
  onNavigateToProfile?: () => void;
}

export const TenantFullScreenView: React.FC<TenantFullScreenViewProps> = ({
  onClose,
  onNavigateToProfile,
}) => {
  const userProfile = useUserProfile();
  const [activation, setActivation] = useState<TenantActivation | null>(() =>
    getCurrentUserTenantActivation()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TenantTab>('overview');

  const isProfileApproved = userProfile?.status === 'approved';
  const isTenantApproved = activation?.status === 'approved';

  const refreshActivationState = useCallback(() => {
    const act = getCurrentUserTenantActivation();
    setActivation(act);
  }, []);

  useEffect(() => {
    refreshActivationState();
    window.addEventListener('app-tenant-updated', refreshActivationState);
    window.addEventListener('app-profile-updated', refreshActivationState);
    return () => {
      window.removeEventListener('app-tenant-updated', refreshActivationState);
      window.removeEventListener('app-profile-updated', refreshActivationState);
    };
  }, [refreshActivationState]);

  const handleActivate = () => {
    if (!userProfile) return;
    setIsSubmitting(true);

    try {
      const newAct = requestTenantActivation({
        userId: userProfile.id,
        fullName: userProfile.fullName || 'Registered User',
        email: userProfile.email || 'user@example.com',
        phone: userProfile.phone || '',
        occupation: userProfile.occupation || 'Member',
        location: userProfile.location || '',
        profilePicture: userProfile.profilePicture || null,
      });

      setActivation(newAct);
      setToastMessage('Activation request sent to Admin in Tenant feature menu!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="tenant-fullscreen-feature"
      className="fixed inset-0 z-50 bg-white text-neutral-900 flex flex-col overflow-hidden"
    >
      {/* Empty Top Menu Bar with Back Button */}
      <header
        id="tenant-empty-top-menu-bar"
        className="sticky top-0 z-50 bg-white border-b border-neutral-100 h-14 px-4 flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <button
            id="btn-tenant-back"
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Empty top menu bar center space */}
        <div id="tenant-top-menu-empty-space" className="flex-1" />

        {/* Right Corner: Profile picture logo attachment if available */}
        {userProfile?.profilePicture && (
          <div className="flex items-center gap-2">
            <div
              id="tenant-user-profile-logo"
              className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 ring-2 ring-neutral-100 shrink-0"
              title={userProfile.fullName}
            >
              <img
                src={userProfile.profilePicture}
                alt={userProfile.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-4 right-4 z-50 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl shadow-lg text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Workspace Body */}
      <main
        id="tenant-fullscreen-canvas"
        className="flex-1 w-full bg-white flex flex-col overflow-y-auto"
      >
        {/* If Tenant feature is approved: Full-Screen Workspace with Navigation */}
        {isTenantApproved ? (
          <div id="tenant-approved-workspace" className="flex-1 flex flex-col">
            <div className="flex-1 p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-neutral-900">Tenant Overview</h2>
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        Verified Account
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Active Tenancies', value: '12', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Verified Seekers', value: '48', icon: UserSearch, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Open Gigs', value: '8', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                          <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                            <stat.icon className="w-4.5 h-4.5" />
                          </div>
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-lg font-black text-neutral-900">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-200 text-center">
                      <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-neutral-700">Property Management</h3>
                      <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                        Track your tenancies, agreements, and active seekers across your workspace.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'verification' && (
                  <motion.div
                    key="verification"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900">Compliance & Verification</h2>
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                      Your identity and property credentials have been verified by our security team.
                    </p>
                  </motion.div>
                )}

                {activeTab === 'active_tenants' && (
                  <motion.div
                    key="active_tenants"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h2 className="text-lg font-bold text-neutral-900">Active Tenants</h2>
                    <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                      <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400 font-medium">No active tenant contracts found.</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'active_seekers' && (
                  <motion.div
                    key="active_seekers"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h2 className="text-lg font-bold text-neutral-900">Active Seekers</h2>
                    <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                      <UserSearch className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400 font-medium">No verified seekers currently assigned.</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'active_gigs' && (
                  <motion.div
                    key="active_gigs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h2 className="text-lg font-bold text-neutral-900">Active GiGs</h2>
                    <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                      <Briefcase className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400 font-medium">No active gigs posted by this tenant.</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'agreement_forms' && (
                  <motion.div
                    key="agreement_forms"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h2 className="text-lg font-bold text-neutral-900">Agreement Forms</h2>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'Standard Tenancy Agreement',
                        'Maintenance Request Form',
                        'Liability Waiver',
                        'Identity Consent Form',
                      ].map((form, i) => (
                        <div key={i} className="p-4 bg-white border border-neutral-200 rounded-2xl flex items-center justify-between group hover:border-neutral-900 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900" />
                            <span className="text-xs font-bold text-neutral-800">{form}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-300" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <TenantBottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        ) : !isProfileApproved ? (
          /* Profile NOT Approved Yet: Informs user that profile must be approved first */
          <div
            id="tenant-locked-unapproved-profile"
            className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm p-6 bg-neutral-50 rounded-3xl border border-neutral-200 shadow-xs flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3.5">
                <Lock className="w-7 h-7 stroke-[2.25]" />
              </div>

              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[11px] font-bold mb-2">
                Profile Approval Required
              </span>

              <h3 className="text-sm font-bold text-neutral-900">
                Activate Tenant Feature
              </h3>

              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Users can activate the Tenant feature after their profile is approved by the admin. Please submit your profile with face and ID photos for verification.
              </p>

              <div className="w-full mt-4 p-3 bg-white rounded-2xl border border-neutral-200 text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-[11px]">Current Profile Status:</span>
                  <span className="font-bold capitalize text-neutral-800">
                    {userProfile?.status === 'in_review'
                      ? 'In Review (15-25m)'
                      : userProfile?.status === 'rejected'
                      ? 'Requires Resubmission'
                      : 'Draft / Unsubmitted'}
                  </span>
                </div>
              </div>

              {onNavigateToProfile && (
                <button
                  id="btn-go-to-profile-verification"
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToProfile();
                  }}
                  className="w-full mt-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Go to Profile Verification</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          </div>
        ) : activation?.status === 'pending' ? (
          /* Profile Approved, but Tenant Activation is Pending Admin Review */
          <div
            id="tenant-activation-pending-screen"
            className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm p-6 bg-neutral-50 rounded-3xl border border-neutral-200 shadow-xs flex flex-col items-center"
            >
              {/* Attached User Profile Picture Logo */}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-amber-400 shadow-md bg-white flex items-center justify-center">
                  {userProfile?.profilePicture ? (
                    <img
                      src={userProfile.profilePicture}
                      alt={userProfile.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-neutral-400" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                </div>
              </div>

              <span className="px-3 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-1.5 border border-amber-200">
                Activation Pending Admin Review
              </span>

              <h3 className="text-sm font-bold text-neutral-900">
                Request Sent to Admin
              </h3>

              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Your Tenant feature activation has been sent with your profile picture attached. The administrator can approve or reject it in the Tenant admin menu.
              </p>

              <div className="w-full mt-4 p-3 bg-white rounded-2xl border border-neutral-200 text-left text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Applicant:</span>
                  <span className="font-bold text-neutral-900">{userProfile?.fullName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Profile Status:</span>
                  <span className="font-bold text-emerald-700">Verified</span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : activation?.status === 'rejected' ? (
          /* Tenant Activation Rejected Screen */
          <div
            id="tenant-activation-rejected-screen"
            className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm p-6 bg-red-50 rounded-3xl border border-red-200 shadow-xs flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-red-400 shadow-md bg-white mb-3 flex items-center justify-center">
                {userProfile?.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt={userProfile.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
              </div>

              <span className="px-3 py-0.5 bg-red-100 text-red-900 rounded-full text-xs font-bold mb-1.5 border border-red-200">
                Activation Not Approved
              </span>

              <h3 className="text-sm font-bold text-neutral-900">
                Tenant Feature Activation Rejected
              </h3>

              <p className="text-xs text-red-800 mt-1.5 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-red-100 w-full text-left">
                {activation.rejectionReason || 'Activation request was rejected by administrator.'}
              </p>

              <button
                id="btn-tenant-reactivate"
                type="button"
                onClick={handleActivate}
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Re-request Activation</span>
              </button>
            </motion.div>
          </div>
        ) : (
          /* Profile Approved, NOT Activated Yet: Ready to Activate */
          <div
            id="tenant-ready-to-activate-screen"
            className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm p-6 bg-neutral-50 rounded-3xl border border-neutral-200 shadow-xs flex flex-col items-center"
            >
              {/* Attached User Profile Picture Logo */}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-emerald-500 shadow-md bg-white flex items-center justify-center">
                  {userProfile?.profilePicture ? (
                    <img
                      src={userProfile.profilePicture}
                      alt={userProfile.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-neutral-400" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-bold border border-emerald-200 mb-2">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Profile Approved & Verified</span>
              </div>

              <h3 className="text-base font-bold text-neutral-900">
                Activate Tenant Feature
              </h3>

              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Your profile has been verified by the admin. Click below to activate your Tenant feature with your profile picture attached.
              </p>

              <button
                id="btn-activate-tenant-now"
                type="button"
                onClick={handleActivate}
                disabled={isSubmitting}
                className="w-full mt-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{isSubmitting ? 'Sending Request...' : 'Activate Tenant Feature'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
