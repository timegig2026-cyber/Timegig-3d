import React, { useState, useEffect } from 'react';
import { ProfileData } from '../../types';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Edit3,
  XCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';

interface InReviewProps {
  data: ProfileData;
  onEdit: () => void;
  onReset: () => void;
}

export const ProfileInReview: React.FC<InReviewProps> = ({
  data,
  onEdit,
  onReset,
}) => {
  // 20 minutes countdown simulation for pending state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // 1. APPROVED STATE (Locked Profile View with Anytime Edit Access)
  if (data.status === 'approved') {
    return (
      <div id="profile-approved-screen" className="flex flex-col gap-4 py-1">
        {/* Verified User Header with Profile Picture */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Avatar with Verified Status Badge */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-emerald-500 shadow-md bg-neutral-100 flex items-center justify-center">
              {data.profilePicture ? (
                <img
                  src={data.profilePicture}
                  alt={data.fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-neutral-600">
                  {data.fullName.charAt(0) || 'U'}
                </span>
              )}
            </div>
            {/* Emerald Checkmark Badge */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile Locked & Verified</span>
          </div>

          <h2 id="approved-user-name" className="text-xl font-extrabold text-neutral-900">
            {data.fullName}
          </h2>

          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            {data.occupation || 'Professional Member'} {data.location ? `· ${data.location}` : ''}
          </p>

          {data.bio && (
            <p className="text-xs text-neutral-600 mt-2 max-w-[320px] leading-relaxed italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
              "{data.bio}"
            </p>
          )}
        </div>

        {/* Lock Security Notice */}
        <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">Identity Verified</p>
              <p className="text-[11px] text-emerald-800/80">
                Credentials locked for trust and security
              </p>
            </div>
          </div>

          <button
            id="btn-edit-approved-profile-top"
            type="button"
            onClick={onEdit}
            className="px-3 py-1.5 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Verified User Details Card */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-3 text-xs">
          <h4 className="font-bold text-neutral-900 flex items-center justify-between pb-1 border-b border-neutral-100">
            <span>Profile Information</span>
            <span className="text-[10px] text-neutral-400 font-normal">Read-only view</span>
          </h4>

          <div className="grid grid-cols-1 gap-2 text-neutral-700">
            {data.email && (
              <div className="flex items-center gap-2.5 text-xs">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-800">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2.5 text-xs">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-800">{data.phone}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-800">{data.location}</span>
              </div>
            )}
            {data.dateOfBirth && (
              <div className="flex items-center gap-2.5 text-xs">
                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-800">Date of Birth: {data.dateOfBirth}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <h5 className="font-semibold text-neutral-900 text-[11px]">Verified ID & Biometrics</h5>
            <div className="flex items-center justify-between text-[11px] bg-neutral-50 p-2 rounded-xl">
              <span className="text-neutral-500">Document Type:</span>
              <span className="font-bold text-neutral-800 capitalize">
                {data.idDocumentType.replace('_', ' ')} (Verified)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] bg-neutral-50 p-2 rounded-xl">
              <span className="text-neutral-500">Face Recognition:</span>
              <span className="font-bold text-emerald-700">Biometric Match Confirmed</span>
            </div>
          </div>
        </div>

        {/* Edit Button (Edit Profile Anytime) */}
        <button
          id="btn-edit-approved-profile-bottom"
          type="button"
          onClick={onEdit}
          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile Information Anytime</span>
        </button>
      </div>
    );
  }

  // 2. REJECTED STATE
  if (data.status === 'rejected') {
    return (
      <div id="profile-rejected-screen" className="flex flex-col gap-5 py-2">
        <div className="flex flex-col items-center text-center pt-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center text-red-600 shadow-md mb-4"
          >
            <XCircle className="w-10 h-10 stroke-[2.25]" />
          </motion.div>

          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 border border-red-200">
            Verification Unsuccessful
          </span>

          <h2 id="rejected-title" className="text-lg font-bold text-neutral-900">
            Verification Requires Resubmission
          </h2>

          <p className="text-xs text-neutral-500 mt-1 max-w-[290px] leading-relaxed">
            Dear <span className="font-semibold text-neutral-800">{data.fullName}</span>, our team reviewed your submission and noted items that require your attention.
          </p>
        </div>

        {/* Rejection Reason Card */}
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Review Feedback & Reason:</span>
          </div>
          <p className="text-xs text-red-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-red-100 font-medium">
            {data.rejectionReason ||
              'Your face photo was unclear or the ID document details did not match. Please upload clearer photos and retry.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            id="btn-fix-resubmit"
            type="button"
            onClick={onEdit}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Details & Resubmit</span>
          </button>

          <button
            id="btn-restart-verification"
            type="button"
            onClick={onReset}
            className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Start Fresh Verification</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. DEFAULT PENDING REVIEW STATE
  return (
    <div id="profile-in-review-screen" className="flex flex-col gap-5 py-2">
      {/* Visual Status Hero */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center text-amber-600 shadow-md">
            <Clock className="w-10 h-10 stroke-[2.25] animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <span className="text-[10px] font-bold">15-25m</span>
            </div>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-100/70 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold uppercase tracking-wider mb-1.5">
          Submission Pending
        </span>

        <h2 id="in-review-title" className="text-lg font-bold text-neutral-900">
          Your Profile is Under Review
        </h2>

        <p id="in-review-subtitle" className="text-xs text-neutral-500 mt-1 max-w-[280px] leading-relaxed">
          Thank you, <span className="font-semibold text-neutral-800">{data.fullName}</span>. Your face photo and ID document have been submitted to the admin team.
        </p>
      </div>

      {/* Prominent 15 to 25 minutes review guarantee card */}
      <div
        id="review-timer-card"
        className="p-4 bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col items-center text-center"
      >
        <p className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
          Estimated Wait Time
        </p>
        <h3 className="text-xl font-extrabold text-amber-950 mt-0.5">
          15 to 25 Minutes
        </h3>

        {/* Live dynamic timer */}
        <div className="mt-3 flex items-center gap-2 px-4 py-1.5 bg-white/90 rounded-full border border-amber-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs font-mono font-bold text-neutral-800">
            Est. Time Remaining: {formattedTime}
          </span>
        </div>

        <p className="text-[11px] text-amber-800/80 mt-2.5 max-w-[280px] leading-relaxed">
          The administrator receives your submitted profile and will review your face photograph and ID document within 15 to 25 minutes.
        </p>
      </div>

      {/* Verification Timeline Steps */}
      <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-neutral-900 mb-1">
          Verification Progress
        </h4>

        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-neutral-900">Personal Information</p>
            <p className="text-[11px] text-neutral-400">Validated and stored</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-neutral-900">Face Photo & ID Document</p>
            <p className="text-[11px] text-neutral-400">Uploaded securely from device</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-3.5 h-3.5 animate-spin" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-amber-900">Admin Biometric & Document Review</p>
            <p className="text-[11px] text-amber-700">Currently in admin review queue (15-25 min)</p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-3 opacity-50">
          <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-neutral-700">Full Profile Activation</p>
            <p className="text-[11px] text-neutral-400">Pending admin approval</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          id="btn-edit-submission"
          type="button"
          onClick={onEdit}
          className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Submitted Details</span>
        </button>

        <button
          id="btn-reset-submission"
          type="button"
          onClick={onReset}
          className="w-full py-2 bg-transparent hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Start New Verification</span>
        </button>
      </div>
    </div>
  );
};
