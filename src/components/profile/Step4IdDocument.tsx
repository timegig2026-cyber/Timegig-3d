import React from 'react';
import { ProfileData } from '../../types';
import { FileUploadZone } from './FileUploadZone';
import { Shield, FileCheck2, CreditCard, BookOpen } from 'lucide-react';

interface Step4Props {
  data: ProfileData;
  onChange: (fields: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4IdDocument: React.FC<Step4Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const hasIdDocument = !!data.idDocumentFront;

  return (
    <div id="step-id-document" className="flex flex-col gap-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-[11px] font-semibold text-blue-800 mb-2">
          <Shield className="w-3.5 h-3.5" /> Identity Document
        </div>
        <h2 className="text-base font-bold text-neutral-900">Upload Government ID</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Select document type and upload high-resolution scan or photo from your device.
        </p>
      </div>

      {/* ID Type Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-neutral-800">
          Select Document Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            id="btn-doc-type-passport"
            onClick={() => onChange({ idDocumentType: 'passport' })}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
              data.idDocumentType === 'passport'
                ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[11px] font-medium">Passport</span>
          </button>

          <button
            type="button"
            id="btn-doc-type-dl"
            onClick={() => onChange({ idDocumentType: 'drivers_license' })}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
              data.idDocumentType === 'drivers_license'
                ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[11px] font-medium">Driver&apos;s License</span>
          </button>

          <button
            type="button"
            id="btn-doc-type-national-id"
            onClick={() => onChange({ idDocumentType: 'national_id' })}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
              data.idDocumentType === 'national_id'
                ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span className="text-[11px] font-medium">National ID</span>
          </button>
        </div>
      </div>

      {/* Primary ID Front Upload */}
      <FileUploadZone
        id="id-document-front-upload"
        label="ID Document Front / Page (Device Upload)"
        description="Clear photo of the photo page or front of the card. Text must be readable."
        accept="image/png,image/jpeg,image/webp,image/jpg,application/pdf"
        value={data.idDocumentFront}
        fileName={data.idDocumentFrontName}
        onChange={(dataUrl, name) =>
          onChange({ idDocumentFront: dataUrl, idDocumentFrontName: name })
        }
        aspectRatio="wide"
      />

      {/* Optional Back Upload for Cards */}
      {data.idDocumentType !== 'passport' && (
        <FileUploadZone
          id="id-document-back-upload"
          label="ID Document Back (Optional)"
          description="Upload the backside of your card if required."
          accept="image/png,image/jpeg,image/webp,image/jpg,application/pdf"
          value={data.idDocumentBack || null}
          fileName={data.idDocumentBackName}
          onChange={(dataUrl, name) =>
            onChange({ idDocumentBack: dataUrl, idDocumentBackName: name })
          }
          aspectRatio="wide"
        />
      )}

      {/* ID Document Security Notice */}
      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-2.5 text-neutral-500 text-[11px] leading-relaxed">
        <Shield className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
        <span>
          Your document is securely encrypted using 256-bit AES encryption. It is solely used for identity verification.
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          id="btn-step4-back"
          type="button"
          onClick={onBack}
          className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          id="btn-step4-next"
          type="button"
          disabled={!hasIdDocument}
          onClick={onNext}
          className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            hasIdDocument
              ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          Review & Submit
        </button>
      </div>
    </div>
  );
};
