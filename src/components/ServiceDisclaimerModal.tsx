import React, { useState, useEffect } from 'react';
import { X, Check, FileText } from 'lucide-react';

interface ServiceDisclaimerModalProps {
  isOpen: boolean;
  onConfirm: (disclaimerData: { agreedAt: string; version: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DISCLAIMER_VERSION = '2026.1';

export const ServiceDisclaimerModal: React.FC<ServiceDisclaimerModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isSubmitting = false
}) => {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (!agreed) return;
    onConfirm({
      agreedAt: new Date().toISOString(),
      version: DISCLAIMER_VERSION
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-sky-50 text-brand-blue flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="qtr-label text-brand-blue">Service Agreement</span>
              <h2
                id="disclaimer-title"
                className="font-heading text-lg sm:text-xl font-extrabold text-navy leading-tight mt-0.5"
              >
                Important: PC Build and Repair Disclaimer
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-navy hover:bg-slate-200/60 rounded-md transition-colors"
            aria-label="Cancel and close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white">
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3.5">
            <p>
              I am not a certified repair shop. I will take reasonable care when carrying out the
              agreed PC build or repair work and will work with you to address problems relating to
              that work.
            </p>
            <p>
              To be covered by this service commitment, you must contact me and arrange to return
              the PC within one month of receiving it if you experience a problem relating to the
              work performed. If you do not contact me or arrange the return within this period,
              coverage under this voluntary service commitment may be affected.
            </p>
            <p>
              If you take the PC to another repair shop or technician and they perform repairs or
              modifications, you must contact me and inform me of the situation. You may be
              responsible for the other repair shop&apos;s charges unless otherwise agreed in
              writing.
            </p>
            <p className="font-semibold text-navy">
              This service commitment does not exclude or limit any rights you may have under
              Australian Consumer Law.
            </p>
          </div>

          <div className="text-[11px] text-slate-500">
            Version {DISCLAIMER_VERSION} · Qwick Tech Repairs · A service of AB Services
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-navy rounded border-slate-300 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-navy leading-snug">
              I have read, understood, and agree to the PC Build and Repair Disclaimer.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!agreed || isSubmitting}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${
                agreed && !isSubmitting
                  ? 'bg-navy hover:bg-navy-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting enquiry...' : 'I agree and continue'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
