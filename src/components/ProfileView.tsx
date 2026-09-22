import React, { useState, useEffect, useCallback } from 'react';
import { ProfileData, ProfileStep } from '../types';
import { Step1BasicInfo } from './profile/Step1BasicInfo';
import { Step2ProfilePicture } from './profile/Step2ProfilePicture';
import { Step3FaceOnlyPicture } from './profile/Step3FaceOnlyPicture';
import { Step4IdDocument } from './profile/Step4IdDocument';
import { Step5ReviewSubmit } from './profile/Step5ReviewSubmit';
import { ProfileInReview } from './profile/ProfileInReview';
import { submitUserProfile } from '../lib/submissionStore';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Lock, ArrowLeft } from 'lucide-react';
import { safeStringify } from '../lib/utils';

const INITIAL_PROFILE: ProfileData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  occupation: '',
  location: '',
  bio: '',
  profilePicture: null,
  faceOnlyPicture: null,
  idDocumentType: 'passport',
  idDocumentFront: null,
  idDocumentFrontName: '',
  idDocumentBack: null,
  idDocumentBackName: '',
  status: 'draft',
  estimatedReviewMinutes: '15 to 25 minutes',
};

const STEP_SEQUENCE: ProfileStep[] = [
  'basic-info',
  'profile-picture',
  'face-only',
  'id-document',
  'review-submit',
];

const STEP_LABELS: Record<string, string> = {
  'basic-info': 'Basic Info',
  'profile-picture': 'Profile Photo',
  'face-only': 'Face Photo',
  'id-document': 'ID Document',
  'review-submit': 'Review',
};

export const ProfileView: React.FC = () => {
  const loadProfile = (): ProfileData => {
    try {
      const saved = localStorage.getItem('app_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PROFILE;
  };

  const [profileData, setProfileData] = useState<ProfileData>(loadProfile);

  const [currentStep, setCurrentStep] = useState<ProfileStep>(() => {
    if (
      profileData.status === 'in_review' ||
      profileData.status === 'approved' ||
      profileData.status === 'rejected'
    ) {
      return 'in-review';
    }
    return 'basic-info';
  });

  const syncProfileFromStorage = useCallback(() => {
    const updated = loadProfile();
    setProfileData(updated);
    if (
      updated.status === 'in_review' ||
      updated.status === 'approved' ||
      updated.status === 'rejected'
    ) {
      setCurrentStep('in-review');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', syncProfileFromStorage);
    return () => window.removeEventListener('storage', syncProfileFromStorage);
  }, [syncProfileFromStorage]);

  useEffect(() => {
    try {
      localStorage.setItem('app_user_profile', safeStringify(profileData));
      // Notify other components of profile picture or data updates
      window.dispatchEvent(new Event('app-profile-updated'));
    } catch {
      // ignore
    }
  }, [profileData]);

  const updateFields = (fields: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < STEP_SEQUENCE.length - 1) {
      setCurrentStep(STEP_SEQUENCE[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_SEQUENCE[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    const updated: ProfileData = {
      ...profileData,
      status: 'in_review',
      submittedAt: new Date().toISOString(),
      rejectionReason: undefined,
    };
    // Submit to admin queue
    submitUserProfile(updated);
    setProfileData(updated);
    setCurrentStep('in-review');
  };

  const handleReset = () => {
    setProfileData(INITIAL_PROFILE);
    setCurrentStep('basic-info');
  };

  const handleEdit = () => {
    setCurrentStep('basic-info');
  };

  const handleReturnToLocked = () => {
    setCurrentStep('in-review');
  };

  const activeIndex = STEP_SEQUENCE.indexOf(currentStep);
  const totalSteps = STEP_SEQUENCE.length;
  const progressPercent = activeIndex >= 0 ? ((activeIndex + 1) / totalSteps) * 100 : 100;

  const isApproved = profileData.status === 'approved';
  const isEditingApproved = isApproved && currentStep !== 'in-review';

  const isSubmittedState =
    currentStep === 'in-review' ||
    profileData.status === 'in_review' ||
    profileData.status === 'approved' ||
    profileData.status === 'rejected';

  return (
    <div id="profile-view-container" className="w-full flex-1 flex flex-col px-5 pt-3 pb-24">
      {/* If currently viewing the Locked/Approved or In-Review or Rejected status screen */}
      {currentStep === 'in-review' && isSubmittedState ? (
        <ProfileInReview
          data={profileData}
          onEdit={handleEdit}
          onReset={handleReset}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Top Bar when editing an approved profile */}
          {isEditingApproved && (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Editing Verified Profile</span>
              </div>
              <button
                type="button"
                onClick={handleReturnToLocked}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 font-semibold rounded-lg border border-emerald-300 text-[11px] cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Locked View</span>
              </button>
            </div>
          )}

          {/* Progress Header */}
          <div id="profile-step-progress" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900 tracking-tight">
                Step {activeIndex + 1} of {totalSteps}: {STEP_LABELS[currentStep]}
              </span>
              <span className="font-semibold text-neutral-400">
                {Math.round(progressPercent)}%
              </span>
            </div>

            {/* Step Bar Indicator */}
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            </div>

            {/* Step Breadcrumbs / Indicators */}
            <div className="flex justify-between pt-1">
              {STEP_SEQUENCE.map((step, idx) => {
                const isPassed = idx < activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <button
                    key={step}
                    id={`progress-step-btn-${idx}`}
                    type="button"
                    onClick={() => {
                      if (isPassed || isEditingApproved) setCurrentStep(step);
                    }}
                    disabled={!isPassed && !isEditingApproved}
                    className={`flex items-center gap-1 text-[11px] select-none ${
                      isPassed || isEditingApproved
                        ? 'text-neutral-900 font-medium cursor-pointer'
                        : isCurrent
                        ? 'text-neutral-900 font-bold'
                        : 'text-neutral-300 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isPassed
                          ? 'bg-neutral-900 text-white'
                          : isCurrent
                          ? 'border border-neutral-900 text-neutral-900'
                          : 'border border-neutral-200 text-neutral-300'
                      }`}
                    >
                      {isPassed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Screen Content */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {currentStep === 'basic-info' && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Step1BasicInfo
                    data={profileData}
                    onChange={updateFields}
                    onNext={handleNext}
                  />
                </motion.div>
              )}

              {currentStep === 'profile-picture' && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Step2ProfilePicture
                    data={profileData}
                    onChange={updateFields}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                </motion.div>
              )}

              {currentStep === 'face-only' && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Step3FaceOnlyPicture
                    data={profileData}
                    onChange={updateFields}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                </motion.div>
              )}

              {currentStep === 'id-document' && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Step4IdDocument
                    data={profileData}
                    onChange={updateFields}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                </motion.div>
              )}

              {currentStep === 'review-submit' && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Step5ReviewSubmit
                    data={profileData}
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                    onJumpToStep={(step) => setCurrentStep(step)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
