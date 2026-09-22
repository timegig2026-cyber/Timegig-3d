import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Check, X, Camera } from 'lucide-react';

interface FileUploadZoneProps {
  id: string;
  label: string;
  description?: string;
  accept?: string;
  value: string | null;
  fileName?: string;
  onChange: (dataUrl: string | null, name?: string) => void;
  aspectRatio?: 'square' | 'wide' | 'auto';
  isFaceOnly?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  id,
  label,
  description,
  accept = 'image/*',
  value,
  fileName,
  onChange,
  aspectRatio = 'square',
  isFaceOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result, file.name);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isImage = value?.startsWith('data:image');

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={`${id}-input`} className="text-xs font-semibold text-neutral-800">
          {label}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <Check className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-neutral-500 leading-relaxed -mt-1">{description}</p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={`${id}-input`}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Upload Box or Preview Container */}
      {!value ? (
        <div
          id={`${id}-dropzone`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-neutral-900 bg-neutral-50 scale-[0.99]'
              : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-700 mb-3">
            {isFaceOnly ? (
              <Camera className="w-6 h-6 stroke-[1.75]" />
            ) : (
              <UploadCloud className="w-6 h-6 stroke-[1.75]" />
            )}
          </div>

          <p className="text-xs font-semibold text-neutral-800 mb-1">
            Tap to upload from device
          </p>
          <p className="text-[11px] text-neutral-400">or drag and drop file here</p>
          <span className="mt-3 text-[10px] text-neutral-400 font-mono">
            JPG, PNG, WEBP, or PDF up to 10MB
          </span>
        </div>
      ) : (
        <div
          id={`${id}-preview-card`}
          className="relative w-full rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-xs p-3"
        >
          <div className="flex items-center gap-3">
            {/* Thumbnail Preview */}
            {isImage ? (
              <div
                className={`relative overflow-hidden rounded-xl bg-neutral-100 border border-neutral-100 shrink-0 ${
                  aspectRatio === 'square'
                    ? 'w-16 h-16'
                    : aspectRatio === 'wide'
                    ? 'w-24 h-16'
                    : 'w-16 h-20'
                }`}
              >
                <img
                  src={value}
                  alt={label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                <FileText className="w-8 h-8" />
              </div>
            )}

            {/* File Info */}
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs font-semibold text-neutral-900 truncate">
                {fileName || 'Uploaded Document'}
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Uploaded successfully
              </p>
              <button
                type="button"
                id={`${id}-btn-change`}
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-[11px] text-neutral-600 font-medium underline hover:text-neutral-900 cursor-pointer"
              >
                Change photo
              </button>
            </div>

            {/* Remove Button */}
            <button
              id={`${id}-btn-remove`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null, undefined);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-600 font-medium">{errorMsg}</p>
      )}
    </div>
  );
};
