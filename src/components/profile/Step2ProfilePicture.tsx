import React from 'react';
import { ProfileData } from '../../types';
import { FileUploadZone } from './FileUploadZone';
import { Image, CheckCircle2 } from 'lucide-react';

interface Step2Props {
  data: ProfileData;
  onChange: (fields: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2ProfilePicture: React.FC<Step2Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const hasPicture = !!data.profilePicture;

  return (
    <div id="step-profile-picture" className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-neutral-900">Upload Profile Picture</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Choose a photo to represent your profile across seekers and gigs.
        </p>
      </div>

      {/* Picture Upload Area */}
      <FileUploadZone
        id="profile-picture-upload"
        label="Profile Picture (Device Upload)"
        description="Select an image file (JPG, PNG) from your device."
        accept="image/png,image/jpeg,image/webp,image/jpg"
        value={data.profilePicture}
        onChange={(dataUrl) => onChange({ profilePicture: dataUrl })}
        aspectRatio="square"
      />

      {/* Guidelines Box */}
      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2 text-neutral-600">
        <p className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-neutral-500" /> Photo Guidelines
        </p>
        <ul className="space-y-1.5 text-[11px] text-neutral-500">
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>High resolution and well-lit photo</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Avoid heavy filters, sunglasses, or obscuring graphics</span>
          </li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          id="btn-step2-back"
          type="button"
          onClick={onBack}
          className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          id="btn-step2-next"
          type="button"
          disabled={!hasPicture}
          onClick={onNext}
          className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            hasPicture
              ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          Continue to Face Photo
        </button>
      </div>
    </div>
  );
};
