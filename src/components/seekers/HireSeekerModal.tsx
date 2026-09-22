import React, { useState } from 'react';
import { SubmissionRecord } from '../../types';
import { createHireProposal } from '../../lib/activityStore';
import { motion } from 'motion/react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Send,
  Calendar,
  Sparkles,
  Briefcase,
  MapPin,
  Clock,
} from 'lucide-react';

interface HireSeekerModalProps {
  seeker: SubmissionRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export const HireSeekerModal: React.FC<HireSeekerModalProps> = ({
  seeker,
  onClose,
  onSuccess,
}) => {
  const [gigTitle, setGigTitle] = useState('');
  const [budget, setBudget] = useState(seeker.hourlyRate || '$50/hr');
  const [timeline, setTimeline] = useState('This week');
  const [message, setMessage] = useState('');
  const [clientName, setClientName] = useState('You');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gigTitle.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createHireProposal({
        seekerId: seeker.id,
        seekerName: seeker.fullName,
        seekerOccupation: seeker.occupation || 'Professional Seeker',
        seekerAvatar: seeker.profilePicture,
        clientName: clientName || 'Verified Client',
        gigTitle: gigTitle.trim(),
        budget: budget.trim(),
        message: message.trim(),
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <div
      id="hire-seeker-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Hire Verified Seeker
              </h3>
              <p className="text-[11px] text-neutral-500">
                Direct proposal & booking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Hire Proposal Sent!
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Your proposal for <strong className="text-neutral-800">{gigTitle}</strong> has been delivered directly to <span className="font-semibold text-neutral-800">{seeker.fullName}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Seeker Mini Summary */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 bg-white">
                  {seeker.profilePicture ? (
                    <img
                      src={seeker.profilePicture}
                      alt={seeker.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-600">
                      {seeker.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">
                    {seeker.fullName}
                  </h4>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-bold">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate">
                  {seeker.occupation || 'Professional Seeker'}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Rate: {seeker.hourlyRate || '$50/hr'}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  GiG / Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  placeholder="e.g., UI Mobile Redesign, Home Wiring, Solar Setup"
                  className="w-full px-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Offered Budget / Rate *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="$50/hr or $250 flat"
                      className="w-full pl-7 pr-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Timeline
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. This week, ASAP"
                      className="w-full pl-7 pr-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Message / Scope of Work *
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you need help with, requirements, and preferred schedule..."
                  className="w-full p-2.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !gigTitle.trim() || !message.trim()}
                className="flex-2 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Hire Proposal'}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
