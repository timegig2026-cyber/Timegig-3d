import React, { useState } from 'react';
import { ProfileData } from '../../types';
import { Clock, CheckCircle2, ShieldCheck, Edit3, ArrowRight } from 'lucide-react';

interface Step5Props {
  data: ProfileData;
  onSubmit: () => void;
  onBack: () => void;
  onJumpToStep: (step: 'basic-info' | 'profile-picture' | 'face-only' | 'id-document') => void;
}

export const Step5ReviewSubmit: React.FC<Step5Props> = ({
  data,
  onSubmit,
  onBack,
  onJumpToStep,
}) => {
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 600);
  };

  const getDocTypeLabel = () => {
    switch (data.idDocumentType) {
      case 'passport':
        return 'Passport';
      case 'drivers_license':
        return "Driver's License";
      case 'national_id':
        return 'National ID';
      default:
        return 'Identity Card';
    }
  };

  return (
    <div id="step-review-submit" className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-neutral-900">Review & Submit</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Please confirm your details and uploaded verification documents.
        </p>
      </div>

      {/* Review Time Guarantee Banner: 15 to 25 minutes */}
      <div
        id="review-estimate-banner"
        className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 shadow-xs"
      >
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
          <Clock className="w-5 h-5 stroke-[2.25]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Verification Estimate
            </span>
          </div>
          <p className="text-sm font-bold text-amber-900 mt-0.5">
            Review takes about 15 to 25 minutes
          </p>
          <p className="text-[11px] text-amber-800/80 mt-1 leading-relaxed">
            Our verification system and compliance team will review your photos and identity documents promptly after submission.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {/* Section 1: Basic Info */}
        <div className="p-3.5 bg-neutral-50/60 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-900">Personal Info</span>
            <button
              type="button"
              id="btn-edit-basic-info"
              onClick={() => onJumpToStep('basic-info')}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-neutral-600">
            <p className="font-semibold text-neutral-800">{data.fullName}</p>
            <p>{data.email} • {data.phone}</p>
            {data.occupation && <p className="text-neutral-500">{data.occupation} • {data.location || 'Location not specified'}</p>}
          </div>
        </div>

        {/* Section 2: Photos (Profile & Face-Only) */}
        <div className="p-3.5 bg-neutral-50/60 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-neutral-900">Verification Photos</span>
            <button
              type="button"
              id="btn-edit-photos"
              onClick={() => onJumpToStep('profile-picture')}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Profile Photo Thumbnail */}
            <div className="p-2 bg-white rounded-lg border border-neutral-200 flex flex-col items-center text-center">
              <span className="text-[10px] font-medium text-neutral-500 mb-1.5">
                Profile Picture
              </span>
              {data.profilePicture ? (
                <img
                  src={data.profilePicture}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border border-neutral-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-[10px]">
                  No Photo
                </div>
              )}
              <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Attached
              </span>
            </div>

            {/* Face-Only Photo Thumbnail */}
            <div className="p-2 bg-white rounded-lg border border-neutral-200 flex flex-col items-center text-center">
              <span className="text-[10px] font-medium text-neutral-500 mb-1.5">
                Face-Only Photo
              </span>
              {data.faceOnlyPicture ? (
                <img
                  src={data.faceOnlyPicture}
                  alt="Face Only"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border border-neutral-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-[10px]">
                  No Photo
                </div>
              )}
              <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Face Verified
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: ID Document */}
        <div className="p-3.5 bg-neutral-50/60 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-900">ID Document</span>
            <button
              type="button"
              id="btn-edit-id-doc"
              onClick={() => onJumpToStep('id-document')}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-200">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-neutral-700" />
              <div>
                <p className="text-xs font-semibold text-neutral-800">{getDocTypeLabel()}</p>
                <p className="text-[10px] text-neutral-400">
                  {data.idDocumentFrontName || 'Front page uploaded'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Uploaded
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
        <input
          id="checkbox-confirm-accurate"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
        />
        <span className="text-[11px] text-neutral-600 leading-snug">
          I confirm that the submitted face photo and official identity document belong to me and all provided details are true and accurate.
        </span>
      </label>

      {/* Navigation & Submit Buttons */}
      <div className="flex items-center gap-3 mt-3">
        <button
          id="btn-step5-back"
          type="button"
          onClick={onBack}
          className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          id="btn-submit-profile"
          type="button"
          disabled={!agreed || isSubmitting}
          onClick={handleSubmit}
          className={`flex-2 py-3 rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer ${
            agreed && !isSubmitting
              ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-md'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : (
            <>
              <span>Submit for Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
