import React from 'react';
import { ProfileData } from '../../types';
import { User, Mail, Phone, Calendar, Briefcase, MapPin } from 'lucide-react';

interface Step1Props {
  data: ProfileData;
  onChange: (fields: Partial<ProfileData>) => void;
  onNext: () => void;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({
  data,
  onChange,
  onNext,
}) => {
  const isFormValid =
    data.fullName.trim() !== '' &&
    data.email.trim() !== '' &&
    data.phone.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <form id="form-step-basic-info" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-neutral-900">Personal Information</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Enter your legal details to begin profile verification.
        </p>
      </div>

      <div className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label htmlFor="input-full-name" className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Full Legal Name <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-neutral-400 absolute left-3.5" />
            <input
              id="input-full-name"
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="input-email" className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5" />
            <input
              id="input-email"
              type="email"
              required
              placeholder="alex.morgan@example.com"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="input-phone" className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5" />
            <input
              id="input-phone"
              type="tel"
              required
              placeholder="+1 (555) 019-2834"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Date of Birth & Occupation in Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="input-dob" className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Date of Birth
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-neutral-400 absolute left-3.5" />
              <input
                id="input-dob"
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => onChange({ dateOfBirth: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-occupation" className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Profession / Role
            </label>
            <div className="relative flex items-center">
              <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3.5" />
              <input
                id="input-occupation"
                type="text"
                placeholder="e.g. Freelancer"
                value={data.occupation}
                onChange={(e) => onChange({ occupation: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Location / City */}
        <div>
          <label htmlFor="input-location" className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Location / City
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5" />
            <input
              id="input-location"
              type="text"
              placeholder="San Francisco, CA"
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Next Button */}
      <button
        id="btn-step1-next"
        type="submit"
        disabled={!isFormValid}
        className={`mt-4 w-full py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          isFormValid
            ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
        }`}
      >
        Continue to Profile Picture
      </button>
    </form>
  );
};
