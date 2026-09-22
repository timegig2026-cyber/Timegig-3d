import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUserProfile } from '../../lib/useUserProfile';
import {
  getTenantActivations,
  requestTenantActivation,
  getCurrentUserTenantActivation,
  recordTenantSubscriptionPayment,
  submitTenantProofOfPayment,
  getTenantReferredUsers,
  addTenantReferredUser,
  updateTenantReferredUserStatus,
  deleteTenantReferredUser,
} from '../../lib/tenantStore';
import { TenantActivation, TenantReferredUser } from '../../types';
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
  Share2,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  CreditCard,
  Building,
  QrCode,
  ShieldAlert,
  Upload,
  FileCheck,
  Trash2,
  Paperclip,
  PartyPopper,
  UserPlus,
  Search,
  Filter,
  Ban,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  SlidersHorizontal,
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPayingSub, setIsPayingSub] = useState(false);
  const [proofFile, setProofFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
  } | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tenant Referred Users State
  const [referredUsers, setReferredUsers] = useState<TenantReferredUser[]>(() =>
    getTenantReferredUsers()
  );
  const [referredSearch, setReferredSearch] = useState('');
  const [referredFilter, setReferredFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [showAddRefModal, setShowAddRefModal] = useState(false);
  const [newRefForm, setNewRefForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    userType: 'Seeker' as 'Seeker' | 'Gig Poster' | 'Sub-Tenant',
    location: 'Johannesburg, South Africa',
    notes: '',
  });

  const loadReferredUsers = useCallback(() => {
    setReferredUsers(getTenantReferredUsers());
  }, []);

  const handleUpdateUserStatus = (id: string, currentStatus: 'active' | 'suspended' | 'pending') => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateTenantReferredUserStatus(id, nextStatus);
    loadReferredUsers();
    setToastMessage(`User status updated to ${nextStatus}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteRefUser = (id: string) => {
    deleteTenantReferredUser(id);
    loadReferredUsers();
    setToastMessage('Referred user removed from tenant network.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddRefUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefForm.fullName || !newRefForm.email) {
      setToastMessage('Please fill in required name and email fields.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    addTenantReferredUser({
      fullName: newRefForm.fullName,
      email: newRefForm.email,
      phone: newRefForm.phone || '+27 82 000 0000',
      userType: newRefForm.userType,
      location: newRefForm.location || 'Gauteng, South Africa',
      status: 'active',
      monthlyIncomeGenerated: 'R150,00',
      notes: newRefForm.notes || 'Added directly by Tenant',
    });

    loadReferredUsers();
    setShowAddRefModal(false);
    setNewRefForm({
      fullName: '',
      email: '',
      phone: '',
      userType: 'Seeker',
      location: 'Johannesburg, South Africa',
      notes: '',
    });
    setToastMessage('New user successfully added to your tenant network!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const inviteCode = activation?.inviteCode || `TENANT-${(userProfile?.id || '88').substring(0, 5).toUpperCase()}`;
  const inviteUrl = activation?.inviteUrl || `https://timegig.app/?ref=${inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setToastMessage('Invite link copied! Share with friends to earn monthly passive income.');
    setTimeout(() => {
      setCopiedLink(false);
      setToastMessage(null);
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`;
      setProofFile({
        name: file.name,
        size: sizeStr,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProofOfPayment = () => {
    if (!proofFile) {
      setToastMessage('Please select or upload a proof of payment document first.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmittingProof(true);
    setTimeout(() => {
      const updated = submitTenantProofOfPayment(
        proofFile.dataUrl,
        proofFile.name,
        'Sub299'
      );
      if (updated) {
        setActivation(updated);
      }
      setIsSubmittingProof(false);
      setShowCongratulations(true);
    }, 1000);
  };

  const handleCapitecPayment = () => {
    setIsPayingSub(true);
    setTimeout(() => {
      recordTenantSubscriptionPayment('Sub299');
      setIsPayingSub(false);
      setToastMessage('Monthly subscription payment (R299,99) confirmed to Matthews Capitec Account!');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Active Tenancies', value: '12', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Monthly Passive', value: activation?.monthlyPassiveEarnings || 'R1,450', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Invited Users', value: String(activation?.invitedUsersCount || 14), icon: Share2, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Subscription', value: activation?.subscriptionPaid ? 'Paid' : 'R299,99/mo', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                          <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                            <stat.icon className="w-4.5 h-4.5" />
                          </div>
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-base font-black text-neutral-900">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Invite & Earn Promotion Banner */}
                    <div className="p-5 bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-950 text-white rounded-3xl shadow-lg border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 bg-amber-400 text-neutral-950 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Passive Income Engine
                        </span>
                        <h3 className="text-base font-extrabold text-white">Earn Monthly Passive Income per Tenant</h3>
                        <p className="text-xs text-neutral-300 max-w-md">
                          Share your personalized tenant link. Earn automated monthly recurring income for every active user joining via your link!
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-black shadow-md flex items-center gap-2 shrink-0 cursor-pointer transition-all active:scale-95"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                      </button>
                    </div>

                    {/* Capitec Subscription Status Banner */}
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0">
                          <CreditCard className="w-5 h-5 text-sky-700" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Monthly Active Account Fee (R299,99)</p>
                          <p className="text-[11px] text-neutral-500">
                            Keeps tenant account active • Matthews Capitec Acc: <span className="font-mono font-bold text-neutral-800">1334067366</span> • Ref: <span className="font-mono font-bold text-amber-600">Sub299</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('subscription')}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all"
                      >
                        {activation?.subscriptionPaid ? 'Account Active' : 'Pay R299,99 to Keep Active'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Invite & Earn Tab */}
                {activeTab === 'invite_income' && (
                  <motion.div
                    key="invite_income"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="p-6 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-neutral-950 rounded-3xl shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 bg-neutral-950/10 backdrop-blur-xs rounded-2xl border border-neutral-950/20">
                          <Share2 className="w-6 h-6 text-neutral-950" />
                        </div>
                        <span className="px-3 py-1 bg-neutral-950 text-amber-400 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                          Tenant Affiliate Link
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-neutral-950">Monthly Passive Income Portal</h2>
                        <p className="text-xs text-neutral-900/90 font-medium mt-1 leading-relaxed max-w-lg">
                          Invite property owners, contractors, or active seekers using your tenant invitation link. Earn monthly passive payouts calculated per active user on your network!
                        </p>
                      </div>

                      <div className="p-3.5 bg-neutral-950/90 backdrop-blur-md rounded-2xl border border-amber-400/30 flex items-center justify-between gap-3 text-white">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Your Personal Referral Link</span>
                          <p className="text-xs font-mono font-bold text-neutral-200 truncate">{inviteUrl}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyInviteLink}
                          className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 shadow-md"
                        >
                          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Estimated Monthly Passive Income</span>
                        </div>
                        <p className="text-2xl font-black text-neutral-900">{activation?.monthlyPassiveEarnings || 'R1,850,00'}</p>
                        <p className="text-[11px] text-neutral-500">Calculated on active network referrals this month.</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                          <Users className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Joined via Link</span>
                        </div>
                        <p className="text-2xl font-black text-neutral-900">{referredUsers.length} Network Users</p>
                        <p className="text-[11px] text-neutral-500">Active users registered with reference code <span className="font-mono font-bold">{inviteCode}</span></p>
                      </div>
                    </div>

                    {/* Manage Link Users Section */}
                    <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-500" />
                            <h3 className="text-base font-extrabold text-neutral-900">Manage Your Link Users</h3>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Manage access, view monthly commission generation, and suspend or activate users who joined via your link.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAddRefModal(true)}
                          className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <UserPlus className="w-4 h-4 text-amber-400" />
                          <span>Add User Manually</span>
                        </button>
                      </div>

                      {/* Search & Filter Controls */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="relative w-full sm:w-64">
                          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={referredSearch}
                            onChange={(e) => setReferredSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                          {(['all', 'active', 'suspended', 'pending'] as const).map((st) => (
                            <button
                              key={`filter-${st}`}
                              type="button"
                              onClick={() => setReferredFilter(st)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                                referredFilter === st
                                  ? 'bg-white text-neutral-900 shadow-xs'
                                  : 'text-neutral-500 hover:text-neutral-900'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Referred Users List */}
                      {referredUsers.filter((u) => {
                        const matchesFilter = referredFilter === 'all' || u.status === referredFilter;
                        const matchesSearch =
                          u.fullName.toLowerCase().includes(referredSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(referredSearch.toLowerCase()) ||
                          u.phone.toLowerCase().includes(referredSearch.toLowerCase());
                        return matchesFilter && matchesSearch;
                      }).length === 0 ? (
                        <div className="p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-center space-y-2">
                          <UserSearch className="w-8 h-8 text-neutral-300 mx-auto" />
                          <p className="text-xs font-bold text-neutral-600">No users found matching filter</p>
                          <p className="text-[11px] text-neutral-400">Share your link or click "Add User Manually" to register new members.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {referredUsers
                            .filter((u) => {
                              const matchesFilter = referredFilter === 'all' || u.status === referredFilter;
                              const matchesSearch =
                                u.fullName.toLowerCase().includes(referredSearch.toLowerCase()) ||
                                u.email.toLowerCase().includes(referredSearch.toLowerCase()) ||
                                u.phone.toLowerCase().includes(referredSearch.toLowerCase());
                              return matchesFilter && matchesSearch;
                            })
                            .map((user) => (
                              <div
                                key={user.id}
                                className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3 hover:border-neutral-300 transition-all"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-black text-sm shrink-0">
                                      {user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-neutral-900">{user.fullName}</p>
                                      <p className="text-[11px] text-neutral-500">{user.email}</p>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      user.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-red-50 text-red-800 border-red-200'
                                    }`}
                                  >
                                    {user.status === 'active' ? 'Active' : 'Suspended'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 p-2.5 bg-white rounded-xl border border-neutral-100 text-[11px]">
                                  <div>
                                    <span className="text-neutral-400 block text-[10px]">User Role</span>
                                    <span className="font-bold text-neutral-800">{user.userType}</span>
                                  </div>
                                  <div>
                                    <span className="text-neutral-400 block text-[10px]">Monthly Yield</span>
                                    <span className="font-bold text-amber-600">{user.monthlyIncomeGenerated}</span>
                                  </div>
                                  <div className="col-span-2 border-t border-neutral-100 pt-1.5 flex items-center justify-between text-neutral-500">
                                    <span>Joined: {new Date(user.joinedAt).toLocaleDateString()}</span>
                                    <span>{user.location}</span>
                                  </div>
                                </div>

                                {/* User Action Buttons */}
                                <div className="flex items-center justify-between pt-1 border-t border-neutral-200/50">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateUserStatus(user.id, user.status)}
                                    className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                      user.status === 'active'
                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                                    }`}
                                  >
                                    <Ban className="w-3 h-3" />
                                    <span>{user.status === 'active' ? 'Suspend User' : 'Reactivate User'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRefUser(user.id)}
                                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                    title="Remove User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Capitec Subscription Payment Tab */}
                {activeTab === 'subscription' && (
                  <motion.div
                    key="subscription"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-neutral-900">Tenant Subscription</h2>
                        <p className="text-xs text-neutral-500">The R299,99 monthly subscription fee keeps your tenant account active</p>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border ${
                        activation?.subscriptionPaid
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{activation?.subscriptionPaid ? 'Account Active (Paid)' : 'Payment Due to Keep Account Active'}</span>
                      </div>
                    </div>

                    {/* Advanced Payment Interface */}
                    <div className="p-5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl shadow-xl border border-neutral-800 space-y-5">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Official Capitec Banking Partner</span>
                            <p className="text-xs font-extrabold text-white">Direct Capitec Bank Transfer</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-amber-400 text-neutral-950 rounded-lg text-xs font-black">
                          R299,99 / Month
                        </span>
                      </div>

                      {/* Banking Details Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-0.5">Account Name</span>
                          <p className="text-sm font-black text-amber-400">Matthews</p>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-0.5">Capitec Account No.</span>
                          <p className="text-sm font-mono font-black text-white">1334067366</p>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-0.5">Required Payment Reference</span>
                          <p className="text-sm font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 inline-block">Sub299</p>
                        </div>
                      </div>

                      {/* Instant Confirmation Action Button */}
                      <div className="pt-1">
                        <button
                          id="btn-confirm-capitec-sub299-payment"
                          type="button"
                          onClick={handleCapitecPayment}
                          disabled={isPayingSub}
                          className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-neutral-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <CreditCard className="w-4 h-4 fill-neutral-950" />
                          <span>
                            {isPayingSub
                              ? 'Verifying Capitec Transfer...'
                              : activation?.subscriptionPaid
                              ? 'Confirm / Re-verify Capitec Payment (Sub299)'
                              : 'Quick Pay Subscription Fee R299,99 (Ref: Sub299)'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Proof of Payment Upload Document Section */}
                    <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-5 h-5 text-amber-600" />
                          <div>
                            <h3 className="text-sm font-bold text-neutral-900">Upload Proof of Payment</h3>
                            <p className="text-[11px] text-neutral-500">Upload Capitec payment receipt or transfer screenshot from device</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold">
                          PDF, JPG, PNG
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {/* File Selection Zone */}
                      {!proofFile ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-6 border-2 border-dashed border-neutral-200 hover:border-amber-400 bg-neutral-50 hover:bg-amber-50/40 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 shadow-xs border border-neutral-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-900">Click to Select Document from Device</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Supports PDF statement, banking screenshot, or pop image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate">{proofFile.name}</p>
                              <p className="text-[10px] font-medium text-neutral-500">{proofFile.size} • Ready for verification</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setProofFile(null)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Proof Document Submit Button */}
                      <button
                        id="btn-submit-proof-of-payment"
                        type="button"
                        onClick={handleSubmitProofOfPayment}
                        disabled={!proofFile || isSubmittingProof}
                        className={`w-full py-3.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          !proofFile || isSubmittingProof
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-98'
                        }`}
                      >
                        {isSubmittingProof ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Submitting Proof of Payment...</span>
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-4 h-4 text-emerald-400" />
                            <span>Submit Proof of Payment Document</span>
                          </>
                        )}
                      </button>

                      {/* Active Proof Verification Status Banner */}
                      {(activation?.proofOfPaymentFileName || activation?.subscriptionVerificationStatus === 'in_review') && (
                        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-3">
                          <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-0.5">
                            <span className="font-black text-sky-900 block">Proof of Payment Under Verification</span>
                            <p className="text-sky-700">
                              Document: <span className="font-bold">{activation?.proofOfPaymentFileName || 'Proof_Document.pdf'}</span>
                            </p>
                            <p className="text-[11px] font-medium text-sky-600">
                              Review takes about <span className="font-bold text-sky-900">15 to 25 minutes</span>.
                            </p>
                          </div>
                        </div>
                      )}
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

      {/* Congratulatory Modal for Proof of Payment Submission */}
      <AnimatePresence>
        {showCongratulations && (
          <motion.div
            id="modal-proof-of-payment-congratulations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 text-center space-y-4 relative overflow-hidden"
            >
              {/* Top Accent Graphic */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400" />

              {/* Icon Badge */}
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-lg animate-bounce">
                <PartyPopper className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Payment Submitted
                </span>
                <h3 className="text-xl font-extrabold text-neutral-900 mt-2">
                  Congratulations! 🎉
                </h3>
                <p className="text-xs font-semibold text-neutral-700 mt-1">
                  Your proof of payment document has been received successfully!
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-neutral-500">Document Uploaded:</span>
                  <span className="font-bold text-neutral-900 truncate max-w-[160px]">
                    {proofFile?.name || activation?.proofOfPaymentFileName || 'Proof_Document.pdf'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-neutral-500">Capitec Account Name:</span>
                  <span className="font-bold text-amber-600">Matthews</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-neutral-500">Capitec Account No.:</span>
                  <span className="font-mono font-bold text-neutral-900">1334067366</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Payment Reference:</span>
                  <span className="font-mono font-bold text-amber-600">Sub299 (R299,99)</span>
                </div>
              </div>

              {/* Estimated Review Time Highlight Box */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-bold">
                  <Clock className="w-5 h-5 text-neutral-950" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-950">Verification Notice</p>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Review takes about <span className="font-bold text-neutral-950 underline decoration-amber-400">15 to 25 minutes</span>.
                  </p>
                </div>
              </div>

              {/* Close / Got it button */}
              <button
                id="btn-close-congratulations-modal"
                type="button"
                onClick={() => {
                  setShowCongratulations(false);
                  setProofFile(null);
                }}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-black rounded-2xl text-xs transition-all shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Great, Got It!</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Referred User Manually Modal */}
      <AnimatePresence>
        {showAddRefModal && (
          <motion.div
            id="modal-add-referred-user"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-extrabold text-neutral-900">Add Network User</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRefModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRefUser} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kagiso Molefe"
                    value={newRefForm.fullName}
                    onChange={(e) => setNewRefForm({ ...newRefForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kagiso@gmail.com"
                      value={newRefForm.email}
                      onChange={(e) => setNewRefForm({ ...newRefForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+27 82 123 4567"
                      value={newRefForm.phone}
                      onChange={(e) => setNewRefForm({ ...newRefForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      User Type / Role
                    </label>
                    <select
                      value={newRefForm.userType}
                      onChange={(e) =>
                        setNewRefForm({
                          ...newRefForm,
                          userType: e.target.value as 'Seeker' | 'Gig Poster' | 'Sub-Tenant',
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                    >
                      <option value="Seeker">Seeker</option>
                      <option value="Gig Poster">Gig Poster</option>
                      <option value="Sub-Tenant">Sub-Tenant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Soweto, Gauteng"
                      value={newRefForm.location}
                      onChange={(e) => setNewRefForm({ ...newRefForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    Notes / Referral Context
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Joined via WhatsApp tenant link"
                    value={newRefForm.notes}
                    onChange={(e) => setNewRefForm({ ...newRefForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRefModal(false)}
                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>Register User</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
