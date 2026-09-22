import React, { useState } from 'react';
import { SubmissionRecord } from '../../types';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  ScanFace,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  AlertTriangle,
  FileText,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewModalProps {
  submission: SubmissionRecord;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const COMMON_REJECTION_REASONS = [
  'Face photo is blurry, obscured, or lacks proper lighting',
  'ID document is expired or invalid',
  'Name or details on ID do not match personal information',
  'Face photo does not match the photo on the government ID',
  'ID document edges or essential information are cut off',
];

export const ProfileReviewDetailModal: React.FC<ReviewModalProps> = ({
  submission,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rejecting, setRejecting] = useState(false);
  const [selectedReason, setSelectedReason] = useState(COMMON_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; title: string } | null>(null);

  const handleConfirmReject = () => {
    const finalReason = customReason.trim() ? customReason.trim() : selectedReason;
    onReject(submission.id, finalReason);
    setRejecting(false);
    onClose();
  };

  const handleApprove = () => {
    onApprove(submission.id);
    onClose();
  };

  const getStatusBadge = () => {
    switch (submission.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100/80 text-red-800 rounded-full text-xs font-bold border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div
      id="profile-review-modal-overlay"
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="profile-review-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900">
                  {submission.fullName}
                </h3>
                {submission.isCurrentUser && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-bold">
                    You (Active Applet User)
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              id="btn-close-review-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Biometric & Document Comparison Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <ScanFace className="w-4 h-4 text-neutral-600" /> Verification Documents & Biometrics
              </h4>
              <span className="text-[11px] text-neutral-400">Tap image to inspect full size</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Face-Only Photo */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                    <ScanFace className="w-3.5 h-3.5 text-blue-600" /> Face-Only
                  </span>
                  <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    Primary Bio
                  </span>
                </div>
                <div
                  onClick={() =>
                    submission.faceOnlyPicture &&
                    setEnlargedImage({
                      url: submission.faceOnlyPicture,
                      title: `Face-Only Photo: ${submission.fullName}`,
                    })
                  }
                  className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-200 cursor-pointer border border-neutral-200 flex items-center justify-center"
                >
                  {submission.faceOnlyPicture ? (
                    <>
                      <img
                        src={submission.faceOnlyPicture}
                        alt="Face Only"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                        <Eye className="w-4 h-4" /> Inspect
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400">No Face Photo</span>
                  )}
                </div>
              </div>

              {/* 2. Public Profile Photo */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-purple-600" /> Profile Photo
                  </span>
                  <span className="text-[9px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                    Public Avatar
                  </span>
                </div>
                <div
                  onClick={() =>
                    submission.profilePicture &&
                    setEnlargedImage({
                      url: submission.profilePicture,
                      title: `Profile Picture: ${submission.fullName}`,
                    })
                  }
                  className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-200 cursor-pointer border border-neutral-200 flex items-center justify-center"
                >
                  {submission.profilePicture ? (
                    <>
                      <img
                        src={submission.profilePicture}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                        <Eye className="w-4 h-4" /> Inspect
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400">No Profile Photo</span>
                  )}
                </div>
              </div>

              {/* 3. ID Document */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" /> ID Document
                  </span>
                  <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded capitalize">
                    {submission.idDocumentType.replace('_', ' ')}
                  </span>
                </div>
                <div
                  onClick={() =>
                    submission.idDocumentFront &&
                    setEnlargedImage({
                      url: submission.idDocumentFront,
                      title: `ID Document (${submission.idDocumentType}): ${submission.fullName}`,
                    })
                  }
                  className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-200 cursor-pointer border border-neutral-200 flex items-center justify-center"
                >
                  {submission.idDocumentFront ? (
                    <>
                      <img
                        src={submission.idDocumentFront}
                        alt="ID Document"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                        <Eye className="w-4 h-4" /> Inspect
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <FileText className="w-6 h-6" />
                      <span className="text-[10px]">Document Attached</span>
                    </div>
                  )}
                </div>
                {submission.idDocumentFrontName && (
                  <p className="text-[10px] text-neutral-400 truncate mt-1.5">
                    {submission.idDocumentFrontName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Applicant Information Details */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
              Applicant Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-neutral-700">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-neutral-400">Email Address</span>
                  <span className="font-semibold text-neutral-900">{submission.email || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-700">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-neutral-400">Phone Number</span>
                  <span className="font-semibold text-neutral-900">{submission.phone || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-700">
                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-neutral-400">Date of Birth</span>
                  <span className="font-semibold text-neutral-900">{submission.dateOfBirth || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-700">
                <Briefcase className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-neutral-400">Occupation / Role</span>
                  <span className="font-semibold text-neutral-900">{submission.occupation || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-700">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-neutral-400">Location</span>
                  <span className="font-semibold text-neutral-900">{submission.location || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-700">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-neutral-400">Review Window</span>
                  <span className="font-semibold text-neutral-900">{submission.estimatedReviewMinutes}</span>
                </div>
              </div>
            </div>

            {submission.bio && (
              <div className="pt-2 border-t border-neutral-200/60">
                <span className="block text-[10px] text-neutral-400 mb-0.5">Bio / Overview</span>
                <p className="text-xs text-neutral-700 leading-relaxed">{submission.bio}</p>
              </div>
            )}

            {submission.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900">
                <span className="font-bold block mb-0.5">Rejection Reason:</span>
                <p>{submission.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Rejection Sub-form if active */}
          {rejecting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-red-50/60 rounded-2xl border border-red-200 space-y-3"
            >
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Specify Rejection Reason
              </div>

              <div className="space-y-1.5">
                {COMMON_REJECTION_REASONS.map((r, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-2 text-xs text-neutral-800 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      checked={selectedReason === r && !customReason}
                      onChange={() => {
                        setSelectedReason(r);
                        setCustomReason('');
                      }}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Or write custom feedback for user..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-reject"
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer - Review Actions */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              id="btn-modal-reject"
              type="button"
              onClick={() => setRejecting(true)}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> Reject Profile
            </button>

            <button
              id="btn-modal-approve"
              type="button"
              onClick={handleApprove}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Profile
            </button>
          </div>
        </div>

        {/* Full Image Enlarged Viewer */}
        <AnimatePresence>
          {enlargedImage && (
            <div
              className="fixed inset-0 z-70 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setEnlargedImage(null)}
            >
              <div
                className="max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 flex flex-col items-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full flex items-center justify-between px-3 py-2 border-b border-neutral-100">
                  <span className="text-xs font-bold text-neutral-800">
                    {enlargedImage.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEnlargedImage(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-2 max-h-[70vh] overflow-auto flex items-center justify-center">
                  <img
                    src={enlargedImage.url}
                    alt="Document full preview"
                    referrerPolicy="no-referrer"
                    className="max-h-[68vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
