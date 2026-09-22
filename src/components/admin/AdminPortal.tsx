import React, { useState, useEffect } from 'react';
import { SubmissionRecord, AdminFeatureTab, TenantActivation } from '../../types';
import {
  getStoredSubmissions,
  approveSubmission,
  rejectSubmission,
} from '../../lib/submissionStore';
import {
  getTenantActivations,
  approveTenantActivation,
  rejectTenantActivation,
} from '../../lib/tenantStore';
import { ProfileReviewDetailModal } from './ProfileReviewDetailModal';
import {
  FileCheck2,
  Users,
  Briefcase,
  Building2,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Eye,
  Check,
  User,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPortalProps {
  onClose: () => void;
  onProfileReviewed?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  onProfileReviewed,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminFeatureTab>('submissions');
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [tenantActivations, setTenantActivations] = useState<TenantActivation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_review' | 'approved' | 'rejected'>('all');
  const [tenantStatusFilter, setTenantStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSubmissions = () => {
    const list = getStoredSubmissions();
    setSubmissions([...list]);
  };

  const loadTenantActivations = () => {
    const list = getTenantActivations();
    setTenantActivations([...list]);
  };

  useEffect(() => {
    loadSubmissions();
    loadTenantActivations();
    const handleStorageChange = () => {
      loadSubmissions();
      loadTenantActivations();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('app-tenant-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app-tenant-updated', handleStorageChange);
    };
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = (id: string) => {
    const res = approveSubmission(id);
    if (res) {
      loadSubmissions();
      showToast('success', `Approved profile for ${res.fullName}`);
      window.dispatchEvent(new Event('app-profile-updated'));
      if (onProfileReviewed) onProfileReviewed();
    }
  };

  const handleReject = (id: string, reason: string) => {
    const res = rejectSubmission(id, reason);
    if (res) {
      loadSubmissions();
      showToast('error', `Rejected profile for ${res.fullName}`);
      window.dispatchEvent(new Event('app-profile-updated'));
      if (onProfileReviewed) onProfileReviewed();
    }
  };

  const handleApproveTenant = (id: string) => {
    const res = approveTenantActivation(id);
    if (res) {
      loadTenantActivations();
      showToast('success', `Approved Tenant activation for ${res.fullName}`);
    }
  };

  const handleRejectTenant = (id: string, reason?: string) => {
    const res = rejectTenantActivation(id, reason);
    if (res) {
      loadTenantActivations();
      showToast('error', `Rejected Tenant activation for ${res.fullName}`);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'in_review').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  const pendingTenantCount = tenantActivations.filter((t) => t.status === 'pending').length;

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.occupation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTenantActivations = tenantActivations.filter((t) => {
    if (tenantStatusFilter === 'all') return true;
    return t.status === tenantStatusFilter;
  });

  return (
    <div
      id="admin-full-screen-portal"
      className="fixed inset-0 z-50 bg-white text-neutral-900 flex flex-col overflow-hidden"
    >
      {/* Features Top Bar at the very top */}
      <header
        id="admin-very-top-bar"
        className="sticky top-0 z-50 bg-white border-b border-neutral-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs"
      >
        {/* Separated Features Top Menu Bar */}
        <nav
          id="admin-separated-features-top-bar"
          aria-label="Admin Features Navigation"
          className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar"
        >
          {/* Feature 1: Submissions */}
          <button
            id="admin-top-tab-submissions"
            type="button"
            onClick={() => setActiveAdminTab('submissions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeAdminTab === 'submissions'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <FileCheck2
              className={`w-4 h-4 ${
                activeAdminTab === 'submissions' ? 'text-amber-400' : 'text-neutral-500'
              }`}
            />
            <span>Profile Reviews</span>
            {pendingCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeAdminTab === 'submissions'
                    ? 'bg-amber-400 text-neutral-900'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          {/* Feature 2: Seekers */}
          <button
            id="admin-top-tab-seekers"
            type="button"
            onClick={() => setActiveAdminTab('seekers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeAdminTab === 'seekers'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Users
              className={`w-4 h-4 ${
                activeAdminTab === 'seekers' ? 'text-sky-400' : 'text-neutral-500'
              }`}
            />
            <span>Seekers</span>
          </button>

          {/* Feature 3: GiGs */}
          <button
            id="admin-top-tab-gigs"
            type="button"
            onClick={() => setActiveAdminTab('gigs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeAdminTab === 'gigs'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Briefcase
              className={`w-4 h-4 ${
                activeAdminTab === 'gigs' ? 'text-amber-500' : 'text-neutral-500'
              }`}
            />
            <span>GiGs</span>
          </button>

          {/* Feature 4: Tenant */}
          <button
            id="admin-top-tab-tenant"
            type="button"
            onClick={() => setActiveAdminTab('tenant')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeAdminTab === 'tenant'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Building2
              className={`w-4 h-4 ${
                activeAdminTab === 'tenant' ? 'text-teal-400' : 'text-neutral-500'
              }`}
            />
            <span>Tenant</span>
            {pendingTenantCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeAdminTab === 'tenant'
                    ? 'bg-teal-400 text-neutral-900'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {pendingTenantCount}
              </span>
            )}
          </button>

          {/* Feature 5: System */}
          <button
            id="admin-top-tab-system"
            type="button"
            onClick={() => setActiveAdminTab('system')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeAdminTab === 'system'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <ShieldCheck
              className={`w-4 h-4 ${
                activeAdminTab === 'system' ? 'text-emerald-400' : 'text-neutral-500'
              }`}
            />
            <span>System</span>
          </button>
        </nav>

        {/* Exit Admin Button */}
        <button
          id="btn-admin-close-top"
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ml-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>
      </header>

      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-16 right-6 z-50 px-4 py-2.5 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Admin Workspace Area (Clean White Canvas) */}
      <main className="flex-1 w-full bg-white flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Feature 1: Submissions Queue */}
          {activeAdminTab === 'submissions' && (
            <motion.div
              key="admin-submissions"
              id="admin-feature-submissions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5"
            >
              {/* Header / Metric Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Profile Review & Verification Queue
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Live user identity submissions (15 to 25 min SLA)
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    All ({submissions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('in_review')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      statusFilter === 'in_review'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Pending ({pendingCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('approved')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      statusFilter === 'approved'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approved ({approvedCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('rejected')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      statusFilter === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Rejected ({rejectedCount})</span>
                  </button>
                </div>
              </div>

              {/* Search Filter Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search submissions by applicant name, email, or occupation..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                />
              </div>

              {/* Submissions List */}
              {filteredSubmissions.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-neutral-50/60 rounded-2xl border border-dashed border-neutral-200 p-8">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-2xs mb-3">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800">
                    No Submissions Found
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                    {submissions.length === 0
                      ? 'No user profile submissions are pending. Complete a profile in the Profile feature to test the live review pipeline.'
                      : 'No submissions match your active filter or search criteria.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSubmissions.map((sub) => {
                    const isPending = sub.status === 'in_review';
                    const isApproved = sub.status === 'approved';
                    const isRejected = sub.status === 'rejected';

                    return (
                      <div
                        key={sub.id}
                        id={`submission-item-${sub.id}`}
                        className="p-4 bg-white hover:bg-neutral-50/70 border border-neutral-200/90 rounded-2xl shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Left Info with Face / Profile Picture Thumbnails */}
                        <div className="flex items-start gap-3.5">
                          {/* Avatars */}
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                              {sub.profilePicture ? (
                                <img
                                  src={sub.profilePicture}
                                  alt={sub.fullName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-neutral-500 text-sm">
                                  {sub.fullName.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                            {/* Secondary biometric face circle thumbnail */}
                            {sub.faceOnlyPicture && (
                              <div
                                title="Biometric Face Photo"
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full overflow-hidden border-2 border-white bg-neutral-900 shadow-xs"
                              >
                                <img
                                  src={sub.faceOnlyPicture}
                                  alt="Face Biometric"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>

                          {/* Text Data */}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-neutral-900">
                                {sub.fullName}
                              </h3>
                              {sub.isCurrentUser && (
                                <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-700 rounded-md text-[10px] font-bold">
                                  Current User
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-neutral-500 mt-0.5">
                              {sub.occupation || 'Applicant'} · {sub.location || 'Location Not Specified'}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-neutral-400">
                              <span>ID: <strong className="text-neutral-700 capitalize">{sub.idDocumentType.replace('_', ' ')}</strong></span>
                              <span>•</span>
                              <span>Submitted: <strong className="text-neutral-700">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Right Status and Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Status Badge */}
                          <div className="mr-2">
                            {isPending && (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>In Review</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                <span>Rejected</span>
                              </span>
                            )}
                          </div>

                          {/* View Detail Modal Button */}
                          <button
                            id={`btn-view-submission-${sub.id}`}
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            title="Inspect biometric photos & ID document"
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {/* Quick Approve / Reject for Pending items */}
                          {isPending ? (
                            <div className="flex items-center gap-1">
                              <button
                                id={`btn-quick-approve-${sub.id}`}
                                type="button"
                                onClick={() => handleApprove(sub.id)}
                                title="Approve Profile"
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedSubmission(sub)}
                              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                            >
                              Manage
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Feature 2: Seekers (Clean White Canvas) */}
          {activeAdminTab === 'seekers' && (
            <motion.div
              key="admin-empty-seekers"
              id="admin-feature-empty-seekers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 w-full bg-white"
            />
          )}

          {/* Feature 3: GiGs (Clean White Canvas) */}
          {activeAdminTab === 'gigs' && (
            <motion.div
              key="admin-empty-gigs"
              id="admin-feature-empty-gigs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 w-full bg-white"
            />
          )}

          {/* Feature 4: Tenant Activation Review */}
          {activeAdminTab === 'tenant' && (
            <motion.div
              key="admin-tenant-activations"
              id="admin-feature-tenant-activations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-4"
            >
              {/* Filter Tabs Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    <span>Tenant Feature Activation Requests</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Review and approve user requests to activate the Tenant feature.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => {
                    const count =
                      filter === 'all'
                        ? tenantActivations.length
                        : tenantActivations.filter((t) => t.status === filter).length;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setTenantStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                          tenantStatusFilter === filter
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {filter} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activation Requests List */}
              {filteredTenantActivations.length === 0 ? (
                <div className="p-12 text-center bg-neutral-50 rounded-3xl border border-neutral-200/80 mt-4">
                  <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-neutral-700">No Tenant Activation Requests</h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                    When verified users request to activate the Tenant feature, their application with attached profile picture logo will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {filteredTenantActivations.map((item) => {
                    const isPending = item.status === 'pending';
                    const isApproved = item.status === 'approved';
                    const isRejected = item.status === 'rejected';

                    return (
                      <div
                        key={item.id}
                        id={`tenant-activation-card-${item.id}`}
                        className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3 hover:border-neutral-300 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          {/* Attached Profile Picture Logo */}
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-200 bg-neutral-100 flex items-center justify-center shadow-xs">
                              {item.profilePicture ? (
                                <img
                                  src={item.profilePicture}
                                  alt={item.fullName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-neutral-400" />
                              )}
                            </div>
                            {isApproved && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-white">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-xs font-bold text-neutral-900 truncate">
                                {item.fullName}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${
                                  isPending
                                    ? 'bg-amber-100 text-amber-800'
                                    : isApproved
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-neutral-500 font-medium">
                              {item.occupation} {item.location ? `· ${item.location}` : ''}
                            </p>

                            <div className="mt-1.5 space-y-0.5 text-[11px] text-neutral-600">
                              {item.email && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                                  <span className="truncate">{item.email}</span>
                                </div>
                              )}
                              {item.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                                  <span>{item.phone}</span>
                                </div>
                              )}
                            </div>

                            {item.rejectionReason && (
                              <p className="mt-2 text-[11px] text-red-700 bg-red-50 p-2 rounded-xl border border-red-100">
                                Reason: {item.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          <span className="text-[10px] text-neutral-400">
                            {new Date(item.requestedAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRejectTenant(item.id)}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-200"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveTenant(item.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              </>
                            ) : isApproved ? (
                              <button
                                type="button"
                                onClick={() => handleRejectTenant(item.id, 'Revoked by admin')}
                                className="px-2.5 py-1 text-neutral-400 hover:text-red-600 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Revoke Access
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApproveTenant(item.id)}
                                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Re-approve</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Feature 5: System (Clean White Canvas) */}
          {activeAdminTab === 'system' && (
            <motion.div
              key="admin-empty-system"
              id="admin-feature-empty-system"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 w-full bg-white"
            />
          )}
        </AnimatePresence>
      </main>

      {/* Profile Review Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <ProfileReviewDetailModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
