import React, { useState, useEffect } from 'react';
import { MapGig } from '../../types';
import { GIG_CATEGORIES_METADATA, applyToMapGig } from '../../lib/gigStore';
import { useUserProfile } from '../../lib/useUserProfile';
import { openNativeNavigation } from '../../lib/utils';
import {
  MapPin,
  X,
  Clock,
  Send,
  CheckCircle2,
  Briefcase,
  User,
  ShieldCheck,
  Sparkles,
  Phone,
  Loader2,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GigDetailsModalProps {
  gig: MapGig;
  onClose: () => void;
  onApplied: () => void;
}

export const GigDetailsModal: React.FC<GigDetailsModalProps> = ({
  gig,
  onClose,
  onApplied,
}) => {
  const userProfile = useUserProfile();
  const meta = GIG_CATEGORIES_METADATA[gig.category] || GIG_CATEGORIES_METADATA.general;

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicantName, setApplicantName] = useState(userProfile?.fullName || '');
  const [applicantPhone, setApplicantPhone] = useState(userProfile?.phone || '');
  const [proposal, setProposal] = useState(
    `Hi ${gig.posterName}, I am available and experienced for this ${gig.categoryLabel} gig. I can start ${gig.timeframe.toLowerCase()}.`
  );
  const [expectedPay, setExpectedPay] = useState(gig.pay);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWaitingForAcceptance, setIsWaitingForAcceptance] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [arrivalComplete, setArrivalComplete] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isWaitingForAcceptance) {
      // Simulate owner acceptance after 5 seconds
      const timer = setTimeout(() => {
        setIsWaitingForAcceptance(false);
        setIsAccepted(true);
        speak("Start destination");
        
        // Start navigation simulation
        setTimeout(() => {
          setIsNavigating(true);
          // Simulate arrival after 4 more seconds
          setTimeout(() => {
            setArrivalComplete(true);
            speak("Arrived at gig");
          }, 4000);
        }, 1500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isWaitingForAcceptance]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal.trim() || !applicantName.trim()) return;

    setIsSubmitting(true);
    applyToMapGig(
      {
        gigId: gig.id,
        applicantName: applicantName.trim(),
        applicantAvatar: userProfile?.profilePicture || null,
        applicantPhone: applicantPhone.trim() || undefined,
        proposal: proposal.trim(),
        expectedPay: expectedPay.trim(),
      },
      gig.title
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setIsWaitingForAcceptance(true);
    }, 800);
  };

  return (
    <div
      id="gig-details-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 bg-neutral-800 rounded-xl border border-neutral-700">
              {meta.icon}
            </span>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {gig.categoryLabel} GiG
              </span>
              <h2 className="text-sm font-bold tracking-tight truncate max-w-[240px]">
                {gig.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {isNavigating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center space-y-4"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-sky-50 border-2 border-sky-500 flex items-center justify-center text-sky-600 shadow-lg animate-pulse">
                  <Navigation className="w-10 h-10" />
                </div>
                {!arrivalComplete && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                    Go
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-neutral-900">
                  {arrivalComplete ? 'Arrived at Destination' : 'Directing to Owner'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-[200px] mx-auto">
                  {arrivalComplete 
                    ? `You have reached the location: ${gig.locationName}`
                    : `Navigating to ${gig.posterName}'s exact location...`}
                </p>
              </div>

              <div className="w-full space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => openNativeNavigation(gig.lat, gig.lng)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold rounded-2xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Navigation className="w-4 h-4 fill-neutral-950" />
                  <span>Launch Directions on Map App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {arrivalComplete && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 bg-neutral-900 text-white rounded-2xl font-bold text-xs shadow-md"
                  >
                    Close & Start GiG
                  </button>
                )}
              </div>
            </motion.div>
          ) : isAccepted ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">Application Accepted!</h3>
                <p className="text-xs text-neutral-600">The gig owner has accepted your proposal.</p>
              </div>
              <div className="animate-bounce text-sky-600 flex flex-col items-center gap-1">
                <Navigation className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase">Starting Navigation</span>
              </div>
            </div>
          ) : isWaitingForAcceptance ? (
            <div className="p-8 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-neutral-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wide">Waiting for Owner</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Your application has been sent. Please wait while <span className="font-bold text-neutral-800">{gig.posterName}</span> reviews and accepts your request.
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Status</p>
                  <p className="text-xs font-bold text-amber-900">Awaiting Approval...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Key Metrics: Pay, Timeframe, Location */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    R
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 font-medium">Pay Rate</span>
                    <p className="text-xs font-bold text-neutral-900">{gig.pay}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 font-medium">Timeframe</span>
                    <p className="text-xs font-bold text-neutral-900 truncate">{gig.timeframe}</p>
                  </div>
                </div>
              </div>

          {/* Location Pin & Navigation Button */}
          <div className="flex items-center justify-between gap-2.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] text-neutral-400 font-medium">Location Pin</span>
                <p className="text-xs font-semibold text-neutral-800 leading-snug truncate">
                  {gig.locationName}
                </p>
              </div>
            </div>

            <button
              id="btn-navigate-gig-maps"
              type="button"
              onClick={() => openNativeNavigation(gig.lat, gig.lng)}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Open turn-by-turn navigation in device map app"
            >
              <Navigation className="w-3.5 h-3.5 fill-amber-400" />
              <span>Navigate</span>
              <ExternalLink className="w-3 h-3 text-amber-400/80" />
            </button>
          </div>

          {/* Task Description */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Task Scope & Requirements
            </h4>
            <p className="text-xs text-neutral-700 bg-white p-3 rounded-xl border border-neutral-200 leading-relaxed font-normal">
              {gig.description}
            </p>
          </div>

          {/* Posted By Details */}
          <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold text-xs">
                {gig.posterName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">{gig.posterName}</p>
                <span className="text-[10px] text-neutral-500">GiG Poster</span>
              </div>
            </div>
            <span className="text-[10px] bg-neutral-200/80 px-2 py-0.5 rounded-full font-semibold text-neutral-700">
              {gig.applicationsCount || 0} applied
            </span>
          </div>

              {/* Apply Form Toggle */}
              {!showApplyForm ? (
                <button
                  id="btn-open-apply-form"
                  type="button"
                  onClick={() => setShowApplyForm(true)}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Apply to this GiG</span>
                </button>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3 pt-2 border-t border-neutral-200">
                  <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-600" />
                    <span>Submit Your Application</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                        Phone Contact
                      </label>
                      <input
                        type="tel"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="+1 555 0192"
                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                      Your Proposal & Availability
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      placeholder="Introduce yourself and when you can complete the gig..."
                      className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-submit-gig-application"
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? 'Sending Application...' : 'Send Application'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
