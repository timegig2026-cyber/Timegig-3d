import React from 'react';
import { ProfileData } from '../../types';
import { FileUploadZone } from './FileUploadZone';
import { ScanFace, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Step3Props {
  data: ProfileData;
  onChange: (fields: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3FaceOnlyPicture: React.FC<Step3Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const hasFaceOnly = !!data.faceOnlyPicture;

  return (
    <div id="step-face-only-picture" className="flex flex-col gap-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-semibold text-amber-800 mb-2">
          <ScanFace className="w-3.5 h-3.5" /> Verification Step
        </div>
        <h2 className="text-base font-bold text-neutral-900">Upload Face-Only Photo</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Please upload a clear, front-facing close-up photo of your face from your device.
        </p>
      </div>

      {/* Face Only Upload Area */}
      <FileUploadZone
        id="face-only-upload"
        label="Face-Only Photo (Device Upload)"
        description="A clear portrait looking directly at the camera with neutral expression."
        accept="image/png,image/jpeg,image/webp,image/jpg"
        value={data.faceOnlyPicture}
        onChange={(dataUrl) => onChange({ faceOnlyPicture: dataUrl })}
        aspectRatio="square"
        isFaceOnly={true}
      />

      {/* Strict Face-Only Requirements Banner */}
      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2 text-neutral-700">
        <p className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Face-Only Verification Rules
        </p>
        <div className="space-y-1.5 text-[11px] text-neutral-600">
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Face must be clearly centered, visible from forehead to chin</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>No hats, masks, tinted glasses, or headwear (except religious)</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Ensure good indoor/daylight lighting without harsh glare or shadow</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          id="btn-step3-back"
          type="button"
          onClick={onBack}
          className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          id="btn-step3-next"
          type="button"
          disabled={!hasFaceOnly}
          onClick={onNext}
          className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            hasFaceOnly
              ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          Continue to ID Document
        </button>
      </div>
    </div>
  );
};
